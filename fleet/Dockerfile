FROM node:24 AS base

RUN git clone https://github.com/rancher/fleet-docs.git /home/node/app
WORKDIR /home/node/app

# install deps
RUN npm install

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/

LABEL org.opencontainers.image.title="Fleet - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Fleet GitOps-based continuous delivery" \
      org.opencontainers.image.documentation="https://fleet.rancher.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
