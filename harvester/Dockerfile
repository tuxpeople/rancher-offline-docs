FROM node:26 AS base
# Node 26 images no longer ship yarn, but the docs tooling runs `yarn --version`
# renovate: datasource=npm depName=yarn
ARG YARN_VERSION=1.22.22
RUN command -v yarn >/dev/null || npm install -g "yarn@${YARN_VERSION}"
ARG BUILD_VERSION=current
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN git clone https://github.com/harvester/docs.git /home/node/app
WORKDIR /home/node/app

# install deps (--legacy-peer-deps required: docusaurus-plugin-openapi-docs peer conflict)
RUN timeout 1200 npm install --legacy-peer-deps --no-audit --no-fund

# Handle versioning:
#   BUILD_VERSION=current (default): dev/next docs with upstream version table
#   BUILD_VERSION=v1.7 (or any stable): only keep that specific version
#
# For stable versions, older entries in versioned_sidebars may reference API docs
# that weren't generated for that version. gen-api-docs handles this best-effort.
RUN if [ "${BUILD_VERSION}" = "current" ]; then \
      echo "Building current (dev) version" ; \
      true ; \
    else \
      echo "Building stable version: ${BUILD_VERSION}" ; \
      printf '["%s"]\n' "${BUILD_VERSION}" > versions.json ; \
      find versioned_docs -maxdepth 1 -mindepth 1 -type d \
        ! -name "version-${BUILD_VERSION}" -exec rm -rf {} + 2>/dev/null || true ; \
      find versioned_sidebars -name "*.json" \
        ! -name "version-${BUILD_VERSION}-sidebars.json" -delete 2>/dev/null || true ; \
    fi

# Generate API docs required by current and versioned sidebars.
RUN if [ "${BUILD_VERSION}" = "current" ]; then \
      npm run gen-api-docs ; \
    else \
      npx docusaurus gen-api-docs all 2>/dev/null \
        || echo "::warning::API docs generation failed — continuing without API docs" ; \
    fi

# generate the static html
# Two SSG workers: each holds the whole site in memory, and with the default
# the build runs out of memory on a GitHub runner
RUN DOCUSAURUS_SSG_WORKER_THREAD_COUNT=2 npm run build
COPY postprocess-docusaurus.mjs /tmp/postprocess-docusaurus.mjs
RUN OFFLINE_DOCS_ROOT_TARGET=v1.8 node /tmp/postprocess-docusaurus.mjs build

###---------
FROM cgr.dev/chainguard/nginx:latest@sha256:5f1056de9a9fd549e9c2a45476375a886c85c8be2b1545e6ecd1bf8fa78c88aa AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
COPY nginx-docs.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.title="Harvester - Offline Documentation" \
      org.opencontainers.image.description="Offline-capable static documentation for Harvester hyper-converged infrastructure" \
      org.opencontainers.image.documentation="https://docs.harvesterhci.io" \
      org.opencontainers.image.vendor="tuxpeople" \
      org.opencontainers.image.licenses="Apache-2.0"
