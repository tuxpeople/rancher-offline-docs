FROM node:24 AS base

RUN git clone https://github.com/rancher-sandbox/docs.rancherdesktop.io.git /home/node/app
WORKDIR /home/node/app

# install deps (--legacy-peer-deps required for peer dependency conflicts)
RUN npm install --legacy-peer-deps

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/

LABEL org.opencontainers.image.title="Rancher Desktop - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Rancher Desktop developer container runtime" \
      org.opencontainers.image.documentation="https://docs.rancherdesktop.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
