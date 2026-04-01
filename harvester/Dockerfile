FROM node:24 AS base

RUN git clone https://github.com/harvester/docs.git /home/node/app
WORKDIR /home/node/app

# install deps (--legacy-peer-deps required: docusaurus-plugin-openapi-docs peer conflict)
RUN npm install --legacy-peer-deps

# generate the static html
RUN npm run build

###---------
FROM cgr.dev/chainguard/nginx AS deploy

COPY --from=base /home/node/app/build /usr/share/nginx/html/
