FROM node:24.22.1-alpine AS web-builder
WORKDIR /app

COPY ./web/package*.json ./
RUN npm install --no-audit --no-fund

ARG VITE_NODE_ENV=production
ARG VITE_APP_ENV=production
ARG VITE_GOOGLE_TAG_MANAGER_ID
ARG VITE_WEB_API_URL
ARG VITE_API_TIMEOUT=10000
ARG VITE_APP_NAME
ARG VITE_MEDIA_BASE_URL
ARG VITE_MAPALAB_BASE_URL
ARG VITE_MAPALAB_API_KEY
ARG VITE_GOOGLE_ANALYTICS_ID
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_NODE_ENV=$VITE_NODE_ENV \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_GOOGLE_TAG_MANAGER_ID=$VITE_GOOGLE_TAG_MANAGER_ID \
    VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID \
    VITE_WEB_API_URL=$VITE_WEB_API_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_MEDIA_BASE_URL=$VITE_MEDIA_BASE_URL \
    VITE_MAPALAB_BASE_URL=$VITE_MAPALAB_BASE_URL \
    VITE_MAPALAB_API_KEY=$VITE_MAPALAB_API_KEY \
    VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY ./web/ .
RUN node -v && npm run build


FROM node:24.22.1-alpine AS admin-builder
WORKDIR /app

COPY ./admin/package*.json ./
RUN npm install --no-audit --no-fund

ARG VITE_NODE_ENV=production
ARG VITE_ADMIN_API_URL
ARG VITE_ADMIN_API_TIMEOUT=10000
ARG VITE_ADMIN_APP_NAME
ARG VITE_MEDIA_BASE_URL
ARG VITE_GOOGLE_ANALYTICS_ID
ARG VITE_GOOGLE_TAG_MANAGER_ID
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_NODE_ENV=$VITE_NODE_ENV \
    VITE_GOOGLE_TAG_MANAGER_ID=$VITE_GOOGLE_TAG_MANAGER_ID \
    VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID \
    VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL \
    VITE_ADMIN_API_TIMEOUT=$VITE_ADMIN_API_TIMEOUT \
    VITE_ADMIN_APP_NAME=$VITE_ADMIN_APP_NAME \
    VITE_MEDIA_BASE_URL=$VITE_MEDIA_BASE_URL \
    VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY ./admin/ .
RUN node -v && npm run build


FROM golang:1.24-alpine AS entrypoint-builder
WORKDIR /src
COPY ./nginx/entrypoint.go .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /entrypoint entrypoint.go


FROM dhi.io/nginx:1.31.9-alpine3.24


COPY --from=entrypoint-builder /entrypoint /usr/local/bin/entrypoint
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/templates/portal.conf.template /etc/nginx/templates/portal.conf.template
COPY ./nginx/static /usr/share/nginx/static


COPY --from=web-builder /app/dist /usr/share/nginx/html
COPY --from=admin-builder /app/dist /usr/share/nginx/html/portal-admin

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint"]