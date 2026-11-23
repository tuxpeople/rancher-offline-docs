FROM node:26 AS base

# docs-common/ai-prompts is an SSH submodule (git@github.com:...); fetch it over HTTPS
RUN git -c "url.https://github.com/.insteadOf=git@github.com:" \
      clone --recurse-submodules https://github.com/kubewarden/docs.git /home/node/app
WORKDIR /home/node/app

# install deps
RUN npm ci || npm install

# generate the static html
RUN make community-local

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:7e12e9b01337d6f0039a0dbf41d97e3abf26fe62c0c9e94c9969bad2398b0973 AS deploy

COPY --from=base /home/node/app/build/site /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Kubewarden - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Kubewarden Kubernetes policy engine" \
      org.opencontainers.image.documentation="https://docs.kubewarden.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
