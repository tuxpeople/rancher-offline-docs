FROM node:24 AS base

# Use the Hugo version upstream builds with (HUGO_VERSION in longhorn/website's
# netlify.toml); whatever Alpine ships fails to render the site templates.
# renovate: datasource=github-releases depName=gohugoio/hugo
ARG HUGO_VERSION=v0.154.5
ARG TARGETARCH
RUN v="${HUGO_VERSION#v}" && \
    base="https://github.com/gohugoio/hugo/releases/download/${HUGO_VERSION}" && \
    deb="hugo_extended_${v}_linux-${TARGETARCH:-amd64}.deb" && \
    cd /tmp && \
    curl -fsSLO "${base}/${deb}" && \
    curl -fsSLO "${base}/hugo_${v}_checksums.txt" && \
    grep " ${deb}\$" "hugo_${v}_checksums.txt" | sha256sum --check && \
    dpkg -i "${deb}" && \
    rm -f "${deb}" "hugo_${v}_checksums.txt" && \
    hugo version

RUN git clone https://github.com/longhorn/website /home/node/app
WORKDIR /home/node/app

# Generate path-relative links so version navigation works below the Rancher proxy URL.
RUN printf '\nrelativeURLs = true\ncanonifyURLs = false\n' >> config.toml

# install deps (for theme/plugins)
RUN npm install

# generate the static html
RUN hugo
COPY postprocess-static.mjs /tmp/postprocess-static.mjs
RUN node /tmp/postprocess-static.mjs public

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:16d0e55ffe62f55744d9b903d8eb57e533d0f660332a9fbb967d78b4e77c8bdb AS deploy

COPY --from=base /home/node/app/public /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Longhorn - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Longhorn cloud-native block storage" \
      org.opencontainers.image.documentation="https://longhorn.io/docs" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
