FROM node:26 AS base

RUN git clone https://github.com/rancher/fleet-docs.git /home/node/app
WORKDIR /home/node/app

# install deps
RUN npm install

# generate the static html
RUN npm run build
COPY postprocess-docusaurus.mjs /tmp/postprocess-docusaurus.mjs
RUN node /tmp/postprocess-docusaurus.mjs build

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:3efdf56b9730d56a9bc88edf268ab72ee965cbb7d116291a8679cd89ef67e0c5 AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Fleet - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Fleet GitOps-based continuous delivery" \
      org.opencontainers.image.documentation="https://fleet.rancher.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
