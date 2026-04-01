FROM node:24 AS base

RUN git clone https://github.com/rancher/rke2-docs /home/node/app
WORKDIR /home/node/app

# remove the url path prefix that breaks dynamic rewrites
RUN sed -i "s/rke2-docs\///g" docusaurus.config.js

# install deps
RUN npm install

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/

LABEL org.opencontainers.image.title="RKE2 - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for RKE2 (Rancher Kubernetes Engine 2)" \
      org.opencontainers.image.documentation="https://docs.rke2.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
