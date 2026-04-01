FROM node:24-alpine AS base

RUN apk add --no-cache git hugo

RUN git clone https://github.com/longhorn/website /home/node/app
WORKDIR /home/node/app

# install deps (for theme/plugins)
RUN npm install

# generate the static html
RUN hugo

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/public /usr/share/nginx/html/

LABEL org.opencontainers.image.title="Longhorn - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Longhorn cloud-native block storage" \
      org.opencontainers.image.documentation="https://longhorn.io/docs" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
