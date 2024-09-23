FROM rust:alpine AS build

WORKDIR /build

COPY . .

RUN apk add --no-cache musl-dev
RUN cargo build --release

################################################################################

FROM oven/bun:alpine AS web
WORKDIR /web

COPY ./src-web .
COPY ./tsconfig.json .
RUN bun build ./app.ts --outfile ./static/app.js

FROM alpine:latest

WORKDIR /app

## copy the main binary
COPY --from=build /build/target/release/Legofy-rs ./entry.legofy

## copy runtime assets which may or may not exist
COPY  ./static ./static
COPY --from=web /web/static/app.js ./static/app.js
COPY ./bucket ./bucket

## ensure the container listens globally on port 8080
ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=5176

EXPOSE 5176
CMD ./entry.legofy