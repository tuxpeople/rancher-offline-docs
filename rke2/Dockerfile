FROM node:26 AS base

RUN git clone https://github.com/rancher/rke2-docs /home/node/app
WORKDIR /home/node/app

# remove the url path prefix that breaks dynamic rewrites
RUN sed -i "s/rke2-docs\///g" docusaurus.config.js

# use hash-based routes so Docusaurus ignores the Rancher proxy path
COPY prepare-docusaurus.mjs /tmp/prepare-docusaurus.mjs
RUN node /tmp/prepare-docusaurus.mjs docusaurus.config.js

# install deps
RUN npm install

# generate the static html
RUN npm run build
COPY postprocess-docusaurus.mjs /tmp/postprocess-docusaurus.mjs
RUN node /tmp/postprocess-docusaurus.mjs build

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:7f1cc53f9c57ecfd182fa7a266f6178c5ba4b0a826421b87a753021db7d3d430 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="RKE2 - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for RKE2 (Rancher Kubernetes Engine 2)" \
      org.opencontainers.image.documentation="https://docs.rke2.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
