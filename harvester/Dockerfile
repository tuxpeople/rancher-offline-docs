FROM node:24 AS base
ARG BUILD_VERSION=current

RUN git clone https://github.com/harvester/docs.git /home/node/app
WORKDIR /home/node/app

# install deps (--legacy-peer-deps required: docusaurus-plugin-openapi-docs peer conflict)
RUN npm install --legacy-peer-deps

# Handle versioning:
#   BUILD_VERSION=current (default): dev/next docs — remove all versioned content
#   BUILD_VERSION=v1.7 (or any stable): only keep that specific version
#
# For stable versions, older entries in versioned_sidebars may reference API docs
# that weren't generated for that version. gen-api-docs handles this best-effort.
RUN if [ "${BUILD_VERSION}" = "current" ]; then \
      echo "Building current (dev) version" ; \
      rm -f versions.json && rm -rf versioned_docs versioned_sidebars ; \
    else \
      echo "Building stable version: ${BUILD_VERSION}" ; \
      printf '["%s"]\n' "${BUILD_VERSION}" > versions.json ; \
      find versioned_docs -maxdepth 1 -mindepth 1 -type d \
        ! -name "version-${BUILD_VERSION}" -exec rm -rf {} + 2>/dev/null || true ; \
      find versioned_sidebars -name "*.json" \
        ! -name "version-${BUILD_VERSION}-sidebars.json" -delete 2>/dev/null || true ; \
    fi

# generate API sidebar (required by docusaurus-plugin-openapi-docs before build)
# For stable versions this may fail if the version isn't in the plugin config — that's OK
RUN npx docusaurus gen-api-docs all 2>/dev/null \
    || echo "::warning::API docs generation failed — continuing without API docs"

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/

LABEL org.opencontainers.image.title="Harvester - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Harvester hyper-converged infrastructure" \
      org.opencontainers.image.documentation="https://docs.harvesterhci.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
