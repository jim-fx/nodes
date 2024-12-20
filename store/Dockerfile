FROM denoland/deno:alpine

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno cache src/server.ts

EXPOSE 8000

CMD ["task", "run"]
