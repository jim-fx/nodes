FROM jimfx/nodes:latest AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json Cargo.lock Cargo.toml ./

COPY packages/ ./packages/
COPY nodes/ ./nodes/
COPY app/package.json ./app/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
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
COPY --from=builder /app/packages/ui/build /app/ui

EXPOSE 80
