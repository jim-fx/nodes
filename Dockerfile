FROM node:24-alpine

RUN apk add --no-cache --update curl rclone g++

RUN RUSTUP_URL="https://sh.rustup.rs" \
  && curl --silent --show-error --location --fail --retry 3 --proto '=https' --tlsv1.2 --output /tmp/rustup-linux-install.sh $RUSTUP_URL \
  && sh /tmp/rustup-linux-install.sh -y

ENV RUSTUP_HOME=/usr/local/rustup \
  CARGO_HOME=/usr/local/cargo \
  PATH=/usr/local/cargo/bin:$PATH

RUN curl --silent --show-error --location --fail --retry 3 \
  --proto '=https' --tlsv1.2 \
  --output /tmp/rustup-init.sh https://sh.rustup.rs \
  && sh /tmp/rustup-init.sh -y --no-modify-path --profile minimal \
  && rm /tmp/rustup-init.sh \
  && rustup default stable \
  && rustup target add wasm32-unknown-unknown \
  && cargo install wasm-pack \
  && npm i -g pnpm
