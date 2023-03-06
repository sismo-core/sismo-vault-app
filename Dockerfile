FROM node:16 AS build

WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN npm run build

FROM nginx:1.18-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /build/build /usr/src/app/build
