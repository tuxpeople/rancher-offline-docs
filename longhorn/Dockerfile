FROM node:24-alpine AS base

RUN apk add --no-cache git hugo

RUN git clone https://github.com/longhorn/website /home/node/app
WORKDIR /home/node/app

# install deps (for theme/plugins)
RUN npm install

# generate the static html
RUN hugo

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/public /usr/share/nginx/html/
