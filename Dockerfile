# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://2.25.147.236:5000
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.d/10-env-config.sh /docker-entrypoint.d/10-env-config.sh

RUN sed -i 's/\r$//' /docker-entrypoint.d/10-env-config.sh \
  && chmod +x /docker-entrypoint.d/10-env-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
