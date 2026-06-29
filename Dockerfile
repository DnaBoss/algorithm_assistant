FROM node:22-bookworm AS frontend-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM rust:1.88-bookworm AS api-builder
WORKDIR /app

COPY server/Cargo.toml server/Cargo.lock ./server/
COPY server/src ./server/src
COPY server/migrations ./server/migrations
RUN cargo build --manifest-path server/Cargo.toml --release

FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=api-builder /app/server/target/release/exactlyone-blog-api /app/exactlyone-blog-api
COPY --from=api-builder /app/server/migrations /app/server/migrations
COPY --from=frontend-builder /app/dist /app/dist

ENV HOST=0.0.0.0
ENV PORT=8080
ENV STATIC_DIR=/app/dist
ENV BLOG_MEDIA_DIR=/tmp/exactlyone-media
ENV BLOG_MEDIA_PUBLIC_PATH=/media

EXPOSE 8080

CMD ["/app/exactlyone-blog-api", "serve"]
