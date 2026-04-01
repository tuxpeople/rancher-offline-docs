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
