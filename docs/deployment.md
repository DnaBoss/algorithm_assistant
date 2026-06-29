# Deployment

ExactlyOne currently has two deployable parts:

- Static frontend built with `npm run build`.
- Rust blog API built from `server/`.

Production deploys them as one Cloud Run service. The Docker image builds the
frontend first, copies `dist/` into the runtime image, and lets the Rust service
serve both `/api/*` and the public website.

## GCP Target

Recommended default:

- GCP project: `project-6da9ef70-b473-43b3-b92`
- Cloud Run service: `exactlyone-web`
- Region: `asia-east1`
- Artifact Registry repository: `exactlyone`
- Cloud SQL instance: `exactlyone-pg`
- Domain: `exactlyone.dev`

Required runtime configuration for the blog API:

- `DATABASE_URL`
- `ADMIN_JWT_SECRET`
- `BLOG_MEDIA_DIR`
- `BLOG_MEDIA_PUBLIC_PATH`
- `AUTO_MIGRATE`

Store production secrets in Secret Manager:

```bash
printf '%s' 'postgres://...' | gcloud secrets create exactlyone-database-url --data-file=-
openssl rand -base64 48 | gcloud secrets create exactlyone-admin-jwt-secret --data-file=-
```

Production also uses `exactlyone-admin-password` for the first admin account.
Retrieve it locally when needed:

```bash
gcloud secrets versions access latest \
  --secret exactlyone-admin-password \
  --project project-6da9ef70-b473-43b3-b92
```

For Cloud SQL through Cloud Run, use a socket URL like:

```text
postgres://exactlyone:<password>@/exactlyone?host=/cloudsql/<project>:<region>:<instance>
```

Run database migrations before starting a new API release:

```bash
npm run db:migrate
```

Run a database backup before migrations that change stored content:

```bash
./scripts/backup-blog-db.sh
```

## Build And Deploy

After selecting a GCP account and project:

```bash
gcloud auth login
gcloud config set project <project-id>
PROJECT_ID=<project-id> ./scripts/deploy-gcp.sh
```

The script enables required APIs, creates the Artifact Registry repository if
needed, builds the Docker image with Cloud Build, deploys Cloud Run, and prints
the service URL.

## Admin Seed

Seed or rotate the production admin account through a Cloud Run Job. The job is
idempotent and updates the password hash when the admin email already exists.

```bash
gcloud run jobs execute exactlyone-seed-admin \
  --region asia-east1 \
  --project project-6da9ef70-b473-43b3-b92 \
  --wait
```

The current production admin email is `if.and.only.if.law@gmail.com`.

## Domain Mapping

Map `exactlyone.dev` to the Cloud Run service:

```bash
gcloud beta run domain-mappings create \
  --service exactlyone-web \
  --domain exactlyone.dev \
  --region asia-east1 \
  --project project-6da9ef70-b473-43b3-b92
```

If Google reports that the domain is not verified, run:

```bash
gcloud domains verify exactlyone.dev \
  --project project-6da9ef70-b473-43b3-b92
```

Finish the Search Console verification first, then rerun the domain mapping
command. The domain currently uses registrar nameservers, so DNS records must be
updated at the registrar unless the domain is moved to Cloud DNS.

Then update DNS at the domain registrar to the records printed by GCP. Verify:

```bash
dig exactlyone.dev
curl -I https://exactlyone.dev
```

Until domain verification and DNS updates are complete, the live Cloud Run URL is:

```text
https://exactlyone-web-1012832361406.asia-east1.run.app
```

## Local Container Smoke Test

```bash
docker build -t exactlyone-web:local .
docker run --rm -p 8080:8080 \
  -e DATABASE_URL=postgres://exactlyone:exactlyone@host.docker.internal:15433/exactlyone \
  -e ADMIN_JWT_SECRET=local-dev-secret \
  exactlyone-web:local
```
