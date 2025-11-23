FROM node:24-alpine

RUN apk add --no-cache --update curl rclone g++

# Install rust
# https://github.com/rust-lang/rustup/issues/1085
RUN RUSTUP_URL="https://sh.rustup.rs" \
  && curl --silent --show-error --location --fail --retry 3 --proto '=https' --tlsv1.2 --output /tmp/rustup-linux-install.sh $RUSTUP_URL \
  && sh /tmp/rustup-linux-install.sh -y

ENV PATH=/root/.cargo/bin:$PATH

RUN rustup target add wasm32-unknown-unknown \
  && cargo install wasm-pack \
  && npm i -g pnpm
