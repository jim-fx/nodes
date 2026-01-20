# --- Builder Stage ---
FROM node:24-alpine AS builder

# Install system dependencies
RUN apk add --no-cache curl g++ gcc make libc-dev

# Optimized Rust Installation
ENV RUSTUP_HOME=/usr/local/rustup \
  CARGO_HOME=/usr/local/cargo \
  PATH=/usr/local/cargo/bin:$PATH

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path --profile minimal \
  && rustup target add wasm32-unknown-unknown

WORKDIR /app

# 1. Copy Manifests for Caching
# Copy root manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json Cargo.lock Cargo.toml ./

# Copy all sub-package package.json and Cargo.toml files to cache dependency installation
# This "wildcard" approach in Alpine/sh can be tricky, so we copy the specific directories 
# that define the workspace structure.
COPY packages/ ./packages/
COPY nodes/ ./nodes/
COPY app/package.json ./app/

# 2. Install & Cache Dependencies
# We mount the Cargo registry (crates) and the target folder (compiled artifacts)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  npm install -g pnpm@latest && \
  pnpm install --frozen-lockfile

# 3. Full Source Copy & Build
COPY . .

# We apply the cache mounts again during the build. 
# pnpm build:nodes will now find its Rust artifacts in /app/target from the previous run.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  pnpm build:nodes && \
  pnpm --filter @nodarium/app... build

# --- Static Runner Stage ---
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Minimal static file config
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

# Copy built files
COPY --from=builder /app/app/build /app

EXPOSE 80
