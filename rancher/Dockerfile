FROM node:24 AS base
ARG BUILD_VERSION=current

RUN git clone https://github.com/rancher/rancher-docs /home/node/app
WORKDIR /home/node/app

# install deps
RUN npm install

# Handle versioning:
#   BUILD_VERSION=current (default): latest/current docs — remove versioned content
#   BUILD_VERSION=2.12 (or any stable): only keep that specific version
RUN if [ "${BUILD_VERSION}" = "current" ]; then \
      echo "Building current (latest) version" ; \
      rm -f versions.json && rm -rf versioned_docs versioned_sidebars ; \
    else \
      echo "Building stable version: ${BUILD_VERSION}" ; \
      printf '["%s"]\n' "${BUILD_VERSION}" > versions.json ; \
      find versioned_docs -maxdepth 1 -mindepth 1 -type d \
        ! -name "version-${BUILD_VERSION}" -exec rm -rf {} + 2>/dev/null || true ; \
      find versioned_sidebars -name "*.json" \
        ! -name "version-${BUILD_VERSION}-sidebars.json" -delete 2>/dev/null || true ; \
    fi

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
