FROM node:21

# IMAGE CUSTOMISATIONS

# Install rust
# https://github.com/rust-lang/rustup/issues/1085
RUN RUSTUP_URL="https://sh.rustup.rs" \
  && curl --silent --show-error --location --fail --retry 3 --proto '=https' --tlsv1.2 --output /tmp/rustup-linux-install.sh $RUSTUP_URL \
  && bash /tmp/rustup-linux-install.sh -y \
  && curl https://rclone.org/install.sh --output /tmp/rclone-install.sh \
  && bash /tmp/rclone-install.sh

ENV PATH=/root/.cargo/bin:$PATH

RUN rustup target add wasm32-unknown-unknown \
  && cargo install wasm-pack \
  && npm i -g pnpm
  
