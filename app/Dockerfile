FROM node:24-alpine AS builder

# Install system dependencies
RUN apk add --no-cache curl g++ gcc make libc-dev

ENV RUSTUP_HOME=/usr/local/rustup \
  CARGO_HOME=/usr/local/cargo \
  PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path --profile minimal \
  && rustup target add wasm32-unknown-unknown

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json Cargo.lock Cargo.toml ./

COPY packages/ ./packages/
COPY nodes/ ./nodes/
COPY app/package.json ./app/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  npm install -g pnpm@latest && \
  pnpm install --frozen-lockfile

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  pnpm build:nodes && \
  pnpm --filter @nodarium/app... build

FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY <<EOF /etc/nginx/conf.d/app.conf
server {
    listen 80;
    server_name _;
    root /app;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

COPY --from=builder /app/app/build /app

EXPOSE 80
