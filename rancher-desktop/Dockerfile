FROM node:26 AS base

RUN git clone https://github.com/rancher-sandbox/docs.rancherdesktop.io.git /home/node/app
WORKDIR /home/node/app

# install deps (--legacy-peer-deps required for peer dependency conflicts)
RUN npm install --legacy-peer-deps

# generate the static html
RUN npm run build
COPY postprocess-docusaurus.mjs /tmp/postprocess-docusaurus.mjs
RUN node /tmp/postprocess-docusaurus.mjs build

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:16d0e55ffe62f55744d9b903d8eb57e533d0f660332a9fbb967d78b4e77c8bdb AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Rancher Desktop - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Rancher Desktop developer container runtime" \
      org.opencontainers.image.documentation="https://docs.rancherdesktop.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
