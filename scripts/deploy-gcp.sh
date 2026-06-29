#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?PROJECT_ID is required}"
REGION="${REGION:-asia-east1}"
REPOSITORY="${REPOSITORY:-exactlyone}"
SERVICE="${SERVICE:-exactlyone-web}"
IMAGE="${IMAGE:-exactlyone-web}"
TAG="${TAG:-$(git rev-parse --short HEAD)}"
DATABASE_URL_SECRET="${DATABASE_URL_SECRET:-exactlyone-database-url}"
ADMIN_JWT_SECRET_NAME="${ADMIN_JWT_SECRET_NAME:-exactlyone-admin-jwt-secret}"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE}:${TAG}"
RUN_DEPLOY_ARGS=(
  --project "${PROJECT_ID}"
  --region "${REGION}"
  --platform managed
  --image "${IMAGE_URI}"
  --allow-unauthenticated
  --set-env-vars "STATIC_DIR=/app/dist,BLOG_MEDIA_DIR=/tmp/exactlyone-media,BLOG_MEDIA_PUBLIC_PATH=/media,AUTO_MIGRATE=true,NODE_ENV=production"
  --set-secrets "DATABASE_URL=${DATABASE_URL_SECRET}:latest,ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET_NAME}:latest"
)

if [ -n "${CLOUD_SQL_INSTANCE}" ]; then
  RUN_DEPLOY_ARGS+=(--add-cloudsql-instances "${CLOUD_SQL_INSTANCE}")
fi

gcloud config set project "${PROJECT_ID}"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

if ! gcloud artifacts repositories describe "${REPOSITORY}" --location="${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${REPOSITORY}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="ExactlyOne container images"
fi

gcloud builds submit \
  --tag "${IMAGE_URI}" \
  --project "${PROJECT_ID}" \
  .

gcloud run deploy "${SERVICE}" \
  "${RUN_DEPLOY_ARGS[@]}"

gcloud run services describe "${SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format='value(status.url)'
