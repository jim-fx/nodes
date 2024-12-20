import { StatusCode } from "hono";

export class CustomError extends Error {
  constructor(public status: StatusCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NodeNotFoundError extends CustomError {
  constructor() {
    super(404, "Node not found");
  }
}

export class InvalidNodeDefinitionError extends CustomError {
  constructor() {
    super(400, "Invalid node definition");
  }
}

export class WorkerTimeoutError extends CustomError {
  constructor() {
    super(500, "Worker timed out");
  }
}

export class UnknownWorkerResponseError extends CustomError {
  constructor() {
    super(500, "Unknown worker response");
  }
}
