FROM node:26 AS base

RUN git clone https://github.com/k3s-io/docs /home/node/app
WORKDIR /home/node/app

# remove the url path prefix that breaks dynamic rewrites
RUN sed -i "s/docs\///g" docusaurus.config.js

# install deps
RUN npm install

# generate the static html
RUN npm run build
COPY postprocess-docusaurus.mjs /tmp/postprocess-docusaurus.mjs
RUN node /tmp/postprocess-docusaurus.mjs build

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:f3b23b319f3ccb68cdb01e485427e49f2e88689071173e6dbe93c4dfc7a9a535 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="k3s - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for k3s lightweight Kubernetes" \
      org.opencontainers.image.documentation="https://docs.k3s.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
