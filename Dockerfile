# syntax=docker/dockerfile:1.6

FROM oven/bun:1-alpine AS build
WORKDIR /app

ARG BUILD_MODE=production
ENV BUILD_MODE=${BUILD_MODE}

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bunx vite build --mode "$BUILD_MODE"


FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
