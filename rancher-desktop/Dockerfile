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
FROM cgr.dev/chainguard/nginx:latest@sha256:7f1cc53f9c57ecfd182fa7a266f6178c5ba4b0a826421b87a753021db7d3d430 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Rancher Desktop - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Rancher Desktop developer container runtime" \
      org.opencontainers.image.documentation="https://docs.rancherdesktop.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
