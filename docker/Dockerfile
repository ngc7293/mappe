FROM node:24.8 AS build

WORKDIR /build

COPY package-lock.json /build
COPY package.json      /build

RUN npm install

COPY svelte.config.js /build/
COPY vite.config.ts   /build/
COPY tsconfig.json    /build/

COPY index.html /build/
COPY src/       /build/src/

RUN npm run build

FROM nginx:latest

COPY --from=build /build/dist /usr/share/nginx/html