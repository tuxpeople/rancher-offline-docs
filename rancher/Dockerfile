FROM node:24 AS base

RUN git clone https://github.com/rancher/rancher-docs /home/node/app
WORKDIR /home/node/app

# install deps
RUN npm install

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/

LABEL org.opencontainers.image.title="Rancher Manager - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Rancher Multi-cluster Manager" \
      org.opencontainers.image.documentation="https://ranchermanager.docs.rancher.com" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
