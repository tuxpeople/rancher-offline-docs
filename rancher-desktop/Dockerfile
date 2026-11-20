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
FROM cgr.dev/chainguard/nginx:latest@sha256:c1642395cc75f39c931d66d939f7e78cbdf671d6cfd821616632b0639c3c6d63 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Rancher Desktop - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Rancher Desktop developer container runtime" \
      org.opencontainers.image.documentation="https://docs.rancherdesktop.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
