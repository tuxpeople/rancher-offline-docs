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
FROM cgr.dev/chainguard/nginx:latest@sha256:7e12e9b01337d6f0039a0dbf41d97e3abf26fe62c0c9e94c9969bad2398b0973 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="k3s - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for k3s lightweight Kubernetes" \
      org.opencontainers.image.documentation="https://docs.k3s.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
