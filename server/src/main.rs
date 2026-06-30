use std::{env, net::SocketAddr, path::PathBuf};

use anyhow::{Context, Result};
use argon2::{
    Argon2,
    password_hash::{
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
        rand_core::{OsRng, RngCore},
    },
};
use axum::{
    Json, Router,
    body::Bytes,
    extract::{Multipart, Path, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post, put},
};
use chrono::{DateTime, Utc};
use hmac::{Hmac, Mac};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha1::Sha1;
use sqlx::{PgPool, postgres::PgPoolOptions};
use tokio::{fs, net::TcpListener};
use tower_http::services::{ServeDir, ServeFile};
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    pool: PgPool,
    jwt_secret: String,
    media_dir: PathBuf,
    media_public_path: String,
}

#[derive(Debug)]
struct ApiError {
    status: StatusCode,
    code: &'static str,
}

impl ApiError {
    fn new(status: StatusCode, code: &'static str) -> Self {
        Self { status, code }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.status, Json(serde_json::json!({ "error": self.code }))).into_response()
    }
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: Uuid,
    role: String,
    exp: usize,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BlogPost {
    id: Uuid,
    slug: String,
    status: String,
    title: String,
    excerpt: String,
    category: String,
    tags: Vec<String>,
    date: String,
    updated_at: String,
    read_minutes: i32,
    body: Vec<Value>,
}

#[derive(sqlx::FromRow)]
struct BlogPostRow {
    id: Uuid,
    slug: String,
    status: String,
    title: String,
    excerpt: String,
    category: String,
    tags: Vec<String>,
    read_minutes: i32,
    body: Value,
    published_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BlogPostInput {
    slug: Option<String>,
    status: String,
    title: String,
    excerpt: String,
    category: String,
    tags: Vec<String>,
    read_minutes: i32,
    body: Vec<Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginInput {
    email: String,
    password: String,
    totp_code: Option<String>,
}

#[derive(Serialize)]
struct TokenOutput {
    token: String,
}

#[derive(Serialize)]
struct PostsOutput {
    posts: Vec<BlogPost>,
}

#[derive(Serialize)]
struct PostOutput {
    post: BlogPost,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AdminSecurityOutput {
    email: String,
    display_name: String,
    totp_enabled: bool,
    password_changed_at: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PasswordChangeInput {
    current_password: String,
    new_password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TotpSetupOutput {
    secret: String,
    otpauth_url: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TotpEnableInput {
    code: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TotpDisableInput {
    password: String,
    code: Option<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let command = env::args().nth(1).unwrap_or_else(|| "serve".to_string());
    let config = Config::from_env();
    let pool = PgPoolOptions::new()
        .max_connections(8)
        .connect(&config.database_url)
        .await
        .context("connect database")?;

    match command.as_str() {
        "migrate" => run_migrations(&pool).await,
        "seed-admin" => seed_admin(&pool).await,
        "serve" => serve(config, pool).await,
        _ => anyhow::bail!("unknown command: {command}"),
    }
}

struct Config {
    host: [u8; 4],
    port: u16,
    database_url: String,
    jwt_secret: String,
    media_dir: PathBuf,
    media_public_path: String,
    static_dir: PathBuf,
}

impl Config {
    fn from_env() -> Self {
        Self {
            host: parse_host(&env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string())),
            port: env::var("PORT")
                .or_else(|_| env::var("API_PORT"))
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(4174),
            database_url: env::var("DATABASE_URL").unwrap_or_else(|_| {
                "postgres://exactlyone:exactlyone@127.0.0.1:15433/exactlyone".to_string()
            }),
            jwt_secret: env::var("ADMIN_JWT_SECRET")
                .unwrap_or_else(|_| "dev-only-change-me".to_string()),
            media_dir: PathBuf::from(
                env::var("BLOG_MEDIA_DIR").unwrap_or_else(|_| "storage/media".to_string()),
            ),
            media_public_path: env::var("BLOG_MEDIA_PUBLIC_PATH")
                .unwrap_or_else(|_| "/media".to_string()),
            static_dir: PathBuf::from(
                env::var("STATIC_DIR").unwrap_or_else(|_| "dist".to_string()),
            ),
        }
    }
}

fn parse_host(value: &str) -> [u8; 4] {
    let parts = value
        .split('.')
        .filter_map(|part| part.parse::<u8>().ok())
        .collect::<Vec<_>>();
    if parts.len() == 4 {
        [parts[0], parts[1], parts[2], parts[3]]
    } else {
        [127, 0, 0, 1]
    }
}

async fn serve(config: Config, pool: PgPool) -> Result<()> {
    if env::var("NODE_ENV").as_deref() == Ok("production")
        && config.jwt_secret == "dev-only-change-me"
    {
        anyhow::bail!("ADMIN_JWT_SECRET must be set in production");
    }
    if env::var("AUTO_MIGRATE").as_deref() == Ok("true") {
        run_migrations(&pool).await?;
    }

    fs::create_dir_all(&config.media_dir).await?;
    let state = AppState {
        pool,
        jwt_secret: config.jwt_secret,
        media_dir: config.media_dir.clone(),
        media_public_path: config.media_public_path.clone(),
    };

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/blog/posts", get(list_published_posts))
        .route("/api/blog/posts/{slug}", get(get_published_post))
        .route("/api/admin/login", post(login))
        .route("/api/admin/security", get(admin_security))
        .route("/api/admin/password", put(change_admin_password))
        .route("/api/admin/totp/setup", post(setup_admin_totp))
        .route("/api/admin/totp/enable", post(enable_admin_totp))
        .route("/api/admin/totp/disable", post(disable_admin_totp))
        .route(
            "/api/admin/posts",
            get(list_admin_posts).post(create_admin_post),
        )
        .route(
            "/api/admin/posts/{id}",
            put(update_admin_post).delete(delete_admin_post),
        )
        .route("/api/admin/media", post(upload_media))
        .nest_service(&config.media_public_path, ServeDir::new(&config.media_dir))
        .fallback_service(
            ServeDir::new(&config.static_dir)
                .fallback(ServeFile::new(config.static_dir.join("index.html"))),
        )
        .with_state(state);

    let addr = SocketAddr::from((config.host, config.port));
    let listener = TcpListener::bind(addr).await?;
    println!("ExactlyOne Rust blog API listening on {addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> Json<Value> {
    Json(serde_json::json!({ "ok": true, "service": "exactlyone-rust-blog-api" }))
}

async fn list_published_posts(
    State(state): State<AppState>,
) -> Result<Json<PostsOutput>, ApiError> {
    let rows = sqlx::query_as::<_, BlogPostRow>(
        "select * from blog_posts where status = 'published' order by published_at desc nulls last, created_at desc",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(Json(PostsOutput {
        posts: rows.into_iter().map(to_post).collect(),
    }))
}

async fn get_published_post(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<Json<PostOutput>, ApiError> {
    let row = sqlx::query_as::<_, BlogPostRow>(
        "select * from blog_posts where slug = $1 and status = 'published' limit 1",
    )
    .bind(slug)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    row.map(|post| {
        Json(PostOutput {
            post: to_post(post),
        })
    })
    .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "not_found"))
}

async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginInput>,
) -> Result<Json<TokenOutput>, ApiError> {
    let row: Option<(Uuid, String, bool, Option<String>)> = sqlx::query_as(
        "select id, password_hash, totp_enabled, totp_secret from admin_users where email = $1 and role = 'admin' limit 1",
    )
    .bind(input.email.trim().to_lowercase())
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((id, password_hash, totp_enabled, totp_secret)) = row else {
        return Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "invalid_credentials",
        ));
    };
    if !verify_password(&input.password, &password_hash) {
        return Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "invalid_credentials",
        ));
    }
    if totp_enabled {
        let Some(secret) = totp_secret else {
            return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_totp"));
        };
        if !verify_totp_code(input.totp_code.as_deref().unwrap_or_default(), &secret) {
            return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_totp"));
        }
    }
    Ok(Json(TokenOutput {
        token: sign_token(id, &state.jwt_secret)?,
    }))
}

async fn admin_security(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<AdminSecurityOutput>, ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    let row: Option<(String, String, bool, Option<DateTime<Utc>>)> = sqlx::query_as(
        "select email, display_name, totp_enabled, password_changed_at from admin_users where id = $1 and role = 'admin'",
    )
    .bind(admin_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((email, display_name, totp_enabled, password_changed_at)) = row else {
        return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"));
    };
    Ok(Json(AdminSecurityOutput {
        email,
        display_name,
        totp_enabled,
        password_changed_at: password_changed_at.map(|time| time.format("%Y-%m-%d").to_string()),
    }))
}

async fn change_admin_password(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<PasswordChangeInput>,
) -> Result<StatusCode, ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    if input.new_password.len() < 12 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "password_too_short",
        ));
    }
    let row: Option<(String,)> = sqlx::query_as("select password_hash from admin_users where id = $1")
        .bind(admin_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((password_hash,)) = row else {
        return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"));
    };
    if !verify_password(&input.current_password, &password_hash) {
        return Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "invalid_credentials",
        ));
    }
    let new_hash = hash_password(&input.new_password)
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    sqlx::query("update admin_users set password_hash = $2, password_changed_at = now(), updated_at = now() where id = $1")
        .bind(admin_id)
        .bind(new_hash)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn setup_admin_totp(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<TotpSetupOutput>, ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    let row: Option<(String,)> = sqlx::query_as("select email from admin_users where id = $1")
        .bind(admin_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((email,)) = row else {
        return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"));
    };
    let secret = generate_totp_secret();
    sqlx::query("update admin_users set totp_secret = $2, totp_enabled = false, updated_at = now() where id = $1")
        .bind(admin_id)
        .bind(&secret)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let otpauth_url = format!(
        "otpauth://totp/ExactlyOne:{}?secret={}&issuer=ExactlyOne&algorithm=SHA1&digits=6&period=30",
        email, secret
    );
    Ok(Json(TotpSetupOutput {
        secret,
        otpauth_url,
    }))
}

async fn enable_admin_totp(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<TotpEnableInput>,
) -> Result<StatusCode, ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    let row: Option<(Option<String>,)> =
        sqlx::query_as("select totp_secret from admin_users where id = $1")
            .bind(admin_id)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((Some(secret),)) = row else {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "totp_not_setup"));
    };
    if !verify_totp_code(&input.code, &secret) {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "invalid_totp"));
    }
    sqlx::query("update admin_users set totp_enabled = true, updated_at = now() where id = $1")
        .bind(admin_id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn disable_admin_totp(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<TotpDisableInput>,
) -> Result<StatusCode, ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    let row: Option<(String, bool, Option<String>)> =
        sqlx::query_as("select password_hash, totp_enabled, totp_secret from admin_users where id = $1")
            .bind(admin_id)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let Some((password_hash, totp_enabled, totp_secret)) = row else {
        return Err(ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"));
    };
    if !verify_password(&input.password, &password_hash) {
        return Err(ApiError::new(
            StatusCode::UNAUTHORIZED,
            "invalid_credentials",
        ));
    }
    if totp_enabled {
        let Some(secret) = totp_secret.as_deref() else {
            return Err(ApiError::new(StatusCode::BAD_REQUEST, "totp_not_setup"));
        };
        if !verify_totp_code(input.code.as_deref().unwrap_or_default(), secret) {
            return Err(ApiError::new(StatusCode::BAD_REQUEST, "invalid_totp"));
        }
    }
    sqlx::query("update admin_users set totp_enabled = false, totp_secret = null, updated_at = now() where id = $1")
        .bind(admin_id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(StatusCode::NO_CONTENT)
}

async fn list_admin_posts(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<PostsOutput>, ApiError> {
    require_admin(&state, &headers).await?;
    let rows = sqlx::query_as::<_, BlogPostRow>(
        "select * from blog_posts order by updated_at desc, created_at desc",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(Json(PostsOutput {
        posts: rows.into_iter().map(to_post).collect(),
    }))
}

async fn create_admin_post(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<BlogPostInput>,
) -> Result<(StatusCode, Json<PostOutput>), ApiError> {
    let admin_id = require_admin(&state, &headers).await?;
    let post = insert_post(&state.pool, input, admin_id).await?;
    Ok((StatusCode::CREATED, Json(PostOutput { post })))
}

async fn update_admin_post(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(input): Json<BlogPostInput>,
) -> Result<Json<PostOutput>, ApiError> {
    require_admin(&state, &headers).await?;
    let post = update_post(&state.pool, id, input).await?;
    Ok(Json(PostOutput { post }))
}

async fn delete_admin_post(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, ApiError> {
    require_admin(&state, &headers).await?;
    let result = sqlx::query("delete from blog_posts where id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    if result.rows_affected() == 0 {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "not_found"));
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn upload_media(
    State(state): State<AppState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<Value>), ApiError> {
    let _admin_id = require_admin(&state, &headers).await?;
    let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| ApiError::new(StatusCode::BAD_REQUEST, "invalid_upload"))?
    else {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "missing_file"));
    };
    let original_name = field.file_name().unwrap_or("upload").to_string();
    let mime_type = field
        .content_type()
        .unwrap_or("application/octet-stream")
        .to_string();
    let bytes: Bytes = field
        .bytes()
        .await
        .map_err(|_| ApiError::new(StatusCode::BAD_REQUEST, "invalid_upload"))?;
    let storage_key = Uuid::new_v4().to_string();
    let path = state.media_dir.join(&storage_key);
    fs::write(&path, &bytes)
        .await
        .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    let url = format!("{}/{}", state.media_public_path, storage_key);
    Ok((
        StatusCode::CREATED,
        Json(serde_json::json!({
            "media": {
                "id": storage_key,
                "originalName": original_name,
                "mimeType": mime_type,
                "size": bytes.len(),
                "url": url
            }
        })),
    ))
}

async fn require_admin(state: &AppState, headers: &HeaderMap) -> Result<Uuid, ApiError> {
    let token = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or_else(|| ApiError::new(StatusCode::UNAUTHORIZED, "missing_token"))?;
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"))?;
    let exists: Option<(Uuid,)> =
        sqlx::query_as("select id from admin_users where id = $1 and role = 'admin'")
            .bind(data.claims.sub)
            .fetch_optional(&state.pool)
            .await
            .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    exists
        .map(|row| row.0)
        .ok_or_else(|| ApiError::new(StatusCode::UNAUTHORIZED, "invalid_token"))
}

fn sign_token(id: Uuid, secret: &str) -> Result<String, ApiError> {
    let exp = (Utc::now().timestamp() + 12 * 60 * 60) as usize;
    encode(
        &Header::default(),
        &Claims {
            sub: id,
            role: "admin".to_string(),
            exp,
        },
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))
}

fn hash_password(password: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|error| anyhow::anyhow!("hash password: {error}"))?;
    Ok(hash.to_string())
}

fn verify_password(password: &str, password_hash: &str) -> bool {
    PasswordHash::new(password_hash)
        .ok()
        .and_then(|hash| {
            Argon2::default()
                .verify_password(password.as_bytes(), &hash)
                .ok()
        })
        .is_some()
}

fn generate_totp_secret() -> String {
    let mut bytes = [0_u8; 20];
    OsRng.fill_bytes(&mut bytes);
    base32_no_padding(&bytes)
}

fn verify_totp_code(code: &str, secret: &str) -> bool {
    let code = code.trim().replace(' ', "");
    if code.len() != 6 || !code.chars().all(|item| item.is_ascii_digit()) {
        return false;
    }
    let now_step = Utc::now().timestamp() / 30;
    (-1..=1).any(|offset| totp_code(secret, now_step + offset) == Some(code.as_str().to_string()))
}

fn totp_code(secret: &str, step: i64) -> Option<String> {
    let key = base32_decode_no_padding(secret)?;
    let counter = (step as u64).to_be_bytes();
    let mut mac = Hmac::<Sha1>::new_from_slice(&key).ok()?;
    mac.update(&counter);
    let bytes = mac.finalize().into_bytes();
    let offset = (bytes[19] & 0x0f) as usize;
    let binary = (((bytes[offset] & 0x7f) as u32) << 24)
        | ((bytes[offset + 1] as u32) << 16)
        | ((bytes[offset + 2] as u32) << 8)
        | (bytes[offset + 3] as u32);
    Some(format!("{:06}", binary % 1_000_000))
}

fn base32_no_padding(bytes: &[u8]) -> String {
    const ALPHABET: &[u8; 32] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mut output = String::new();
    let mut buffer = 0_u16;
    let mut bits = 0_u8;
    for byte in bytes {
        buffer = (buffer << 8) | (*byte as u16);
        bits += 8;
        while bits >= 5 {
            let index = ((buffer >> (bits - 5)) & 0b11111) as usize;
            output.push(ALPHABET[index] as char);
            bits -= 5;
        }
    }
    if bits > 0 {
        let index = ((buffer << (5 - bits)) & 0b11111) as usize;
        output.push(ALPHABET[index] as char);
    }
    output
}

fn base32_decode_no_padding(value: &str) -> Option<Vec<u8>> {
    let mut output = Vec::new();
    let mut buffer = 0_u32;
    let mut bits = 0_u8;
    for item in value.chars().filter(|item| !item.is_whitespace()) {
        let upper = item.to_ascii_uppercase();
        let decoded = match upper {
            'A'..='Z' => upper as u8 - b'A',
            '2'..='7' => upper as u8 - b'2' + 26,
            _ => return None,
        } as u32;
        buffer = (buffer << 5) | decoded;
        bits += 5;
        if bits >= 8 {
            output.push(((buffer >> (bits - 8)) & 0xff) as u8);
            bits -= 8;
        }
    }
    Some(output)
}

fn to_post(row: BlogPostRow) -> BlogPost {
    let date = row.published_at.unwrap_or(row.created_at);
    BlogPost {
        id: row.id,
        slug: row.slug,
        status: row.status,
        title: row.title,
        excerpt: row.excerpt,
        category: row.category,
        tags: row.tags,
        date: date.format("%Y-%m-%d").to_string(),
        updated_at: row.updated_at.format("%Y-%m-%d").to_string(),
        read_minutes: row.read_minutes,
        body: row.body.as_array().cloned().unwrap_or_default(),
    }
}

fn post_slug(input: &BlogPostInput) -> String {
    input
        .slug
        .clone()
        .filter(|slug| !slug.trim().is_empty())
        .unwrap_or_else(|| slug::slugify(&input.title))
}

fn validate_input(input: &BlogPostInput) -> Result<(), ApiError> {
    if input.title.trim().is_empty() {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "title_required"));
    }
    if input.category.trim().is_empty() {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "category_required"));
    }
    if input.read_minutes < 1 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "invalid_read_minutes",
        ));
    }
    if input.body.is_empty() {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "body_required"));
    }
    if !matches!(input.status.as_str(), "draft" | "published") {
        return Err(ApiError::new(StatusCode::BAD_REQUEST, "invalid_status"));
    }
    Ok(())
}

async fn insert_post(
    pool: &PgPool,
    input: BlogPostInput,
    author_id: Uuid,
) -> Result<BlogPost, ApiError> {
    validate_input(&input)?;
    let row = sqlx::query_as::<_, BlogPostRow>(
        r#"
        insert into blog_posts (slug, status, title, excerpt, category, tags, read_minutes, body, published_at, author_id)
        values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, case when $2 = 'published' then now() else null end, $9)
        returning *
        "#,
    )
    .bind(post_slug(&input))
    .bind(input.status)
    .bind(input.title)
    .bind(input.excerpt)
    .bind(input.category)
    .bind(input.tags)
    .bind(input.read_minutes)
    .bind(Value::Array(input.body))
    .bind(author_id)
    .fetch_one(pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?;
    Ok(to_post(row))
}

async fn update_post(pool: &PgPool, id: Uuid, input: BlogPostInput) -> Result<BlogPost, ApiError> {
    validate_input(&input)?;
    let row = sqlx::query_as::<_, BlogPostRow>(
        r#"
        update blog_posts
        set slug = $2,
            status = $3,
            title = $4,
            excerpt = $5,
            category = $6,
            tags = $7,
            read_minutes = $8,
            body = $9::jsonb,
            published_at = case
              when $3 = 'published' and published_at is null then now()
              when $3 = 'draft' then null
              else published_at
            end,
            updated_at = now()
        where id = $1
        returning *
        "#,
    )
    .bind(id)
    .bind(post_slug(&input))
    .bind(input.status)
    .bind(input.title)
    .bind(input.excerpt)
    .bind(input.category)
    .bind(input.tags)
    .bind(input.read_minutes)
    .bind(Value::Array(input.body))
    .fetch_optional(pool)
    .await
    .map_err(|_| ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "server_error"))?
    .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "not_found"))?;
    Ok(to_post(row))
}

async fn run_migrations(pool: &PgPool) -> Result<()> {
    sqlx::query(
        "create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())",
    )
    .execute(pool)
    .await?;

    let mut entries = fs::read_dir("server/migrations").await?;
    let mut files = Vec::new();
    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        if path.extension().and_then(|item| item.to_str()) == Some("sql") {
            files.push(path);
        }
    }
    files.sort();

    for path in files {
        let id = path
            .file_name()
            .and_then(|item| item.to_str())
            .unwrap_or_default()
            .to_string();
        let applied: Option<(String,)> =
            sqlx::query_as("select id from schema_migrations where id = $1")
                .bind(&id)
                .fetch_optional(pool)
                .await?;
        if applied.is_some() {
            continue;
        }
        let sql = fs::read_to_string(&path).await?;
        let mut tx = pool.begin().await?;
        sqlx::raw_sql(&sql).execute(&mut *tx).await?;
        sqlx::query("insert into schema_migrations (id) values ($1)")
            .bind(&id)
            .execute(&mut *tx)
            .await?;
        tx.commit().await?;
        println!("applied {id}");
    }
    Ok(())
}

async fn seed_admin(pool: &PgPool) -> Result<()> {
    let email = env::var("ADMIN_EMAIL")
        .context("ADMIN_EMAIL is required")?
        .trim()
        .to_lowercase();
    let password = env::var("ADMIN_PASSWORD").context("ADMIN_PASSWORD is required")?;
    let password_hash = hash_password(&password)?;
    let display_name = email.split('@').next().unwrap_or("owner");
    sqlx::query(
        r#"
        insert into admin_users (email, display_name, password_hash, role)
        values ($1, $2, $3, 'admin')
        on conflict (email) do update
        set password_hash = excluded.password_hash,
            updated_at = now()
        "#,
    )
    .bind(&email)
    .bind(display_name)
    .bind(password_hash)
    .execute(pool)
    .await?;
    println!("admin ready: {email}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn valid_post_input() -> BlogPostInput {
        BlogPostInput {
            slug: None,
            status: "draft".to_string(),
            title: "Rust Blog Service".to_string(),
            excerpt: "A short excerpt".to_string(),
            category: "Engineering".to_string(),
            tags: vec!["Rust".to_string(), "Blog".to_string()],
            read_minutes: 3,
            body: vec![json!({ "kind": "paragraph", "text": "Hello" })],
        }
    }

    #[test]
    fn validates_required_title() {
        let mut input = valid_post_input();
        input.title = "   ".to_string();

        let error = validate_input(&input).expect_err("blank title should fail");

        assert_eq!(error.status, StatusCode::BAD_REQUEST);
        assert_eq!(error.code, "title_required");
    }

    #[test]
    fn validates_allowed_status_values() {
        let mut input = valid_post_input();
        input.status = "archived".to_string();

        let error = validate_input(&input).expect_err("unknown status should fail");

        assert_eq!(error.status, StatusCode::BAD_REQUEST);
        assert_eq!(error.code, "invalid_status");
    }

    #[test]
    fn validates_required_category() {
        let mut input = valid_post_input();
        input.category = " ".to_string();

        let error = validate_input(&input).expect_err("blank category should fail");

        assert_eq!(error.status, StatusCode::BAD_REQUEST);
        assert_eq!(error.code, "category_required");
    }

    #[test]
    fn validates_positive_read_minutes() {
        let mut input = valid_post_input();
        input.read_minutes = 0;

        let error = validate_input(&input).expect_err("zero read minutes should fail");

        assert_eq!(error.status, StatusCode::BAD_REQUEST);
        assert_eq!(error.code, "invalid_read_minutes");
    }

    #[test]
    fn validates_required_body() {
        let mut input = valid_post_input();
        input.body = Vec::new();

        let error = validate_input(&input).expect_err("empty body should fail");

        assert_eq!(error.status, StatusCode::BAD_REQUEST);
        assert_eq!(error.code, "body_required");
    }

    #[test]
    fn derives_slug_from_title_when_slug_is_missing() {
        let input = valid_post_input();

        assert_eq!(post_slug(&input), "rust-blog-service");
    }

    #[test]
    fn preserves_explicit_slug() {
        let mut input = valid_post_input();
        input.slug = Some("custom-slug".to_string());

        assert_eq!(post_slug(&input), "custom-slug");
    }

    #[test]
    fn password_hash_round_trip_verifies_original_password_only() {
        let hash = hash_password("correct horse battery staple").expect("hash password");

        assert!(verify_password("correct horse battery staple", &hash));
        assert!(!verify_password("wrong password", &hash));
    }

    #[test]
    fn base32_round_trip_preserves_totp_secret_bytes() {
        let bytes = b"12345678901234567890";
        let encoded = base32_no_padding(bytes);

        assert_eq!(encoded, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
        assert_eq!(base32_decode_no_padding(&encoded), Some(bytes.to_vec()));
    }

    #[test]
    fn totp_code_matches_rfc6238_sha1_vector() {
        let secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

        assert_eq!(totp_code(secret, 59 / 30).as_deref(), Some("287082"));
        assert_eq!(totp_code(secret, 1111111109 / 30).as_deref(), Some("081804"));
    }
}
