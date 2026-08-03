FROM node:24-alpine AS web-builder
WORKDIR /app
COPY ./web/package*.json ./
RUN npm ci
COPY ./web/ .
ARG VITE_NODE_ENV=production
ARG VITE_GOOGLE_ANALYTICS_ID
ARG VITE_WEB_API_URL
ARG VITE_API_TIMEOUT=10000
ARG VITE_APP_NAME
ARG VITE_MAPALAB_BASE_URL
ARG VITE_MAPALAB_API_KEY
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID
ENV VITE_WEB_API_URL=$VITE_WEB_API_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_MAPALAB_BASE_URL=$VITE_MAPALAB_BASE_URL
ENV VITE_MAPALAB_API_KEY=$VITE_MAPALAB_API_KEY
RUN npm run build

FROM node:24-alpine AS admin-builder
WORKDIR /app
COPY ./admin/package*.json ./
RUN npm ci
COPY ./admin/ .
ARG VITE_NODE_ENV=production
ARG VITE_GOOGLE_ANALYTICS_ID
ARG VITE_ADMIN_API_URL
ARG VITE_ADMIN_API_TIMEOUT=10000
ARG VITE_ADMIN_APP_NAME
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID
ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
ENV VITE_ADMIN_API_TIMEOUT=$VITE_ADMIN_API_TIMEOUT
ENV VITE_ADMIN_APP_NAME=$VITE_ADMIN_APP_NAME
RUN npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/templates/portal.conf.template /etc/nginx/templates/portal.conf.template
COPY ./nginx/static /usr/share/nginx/static
COPY --from=web-builder /app/dist /usr/share/nginx/html
COPY --from=admin-builder /app/dist /usr/share/nginx/html/portal-admin
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
