import { UnknownWorkerResponseError, WorkerTimeoutError } from "../errors.ts";
import { NodeDefinition } from "../validations/types.ts";
import { WorkerMessage } from "./messages.ts";

export function extractDefinition(
  content: ArrayBuffer,
): Promise<NodeDefinition> {
  const worker = new Worker(
    new URL("./node.worker.ts", import.meta.url).href,
    {
      type: "module",
    },
  ) as Worker & {
    postMessage: (message: WorkerMessage) => void;
  };

  return new Promise((res, rej) => {
    worker.postMessage({ action: "extract-definition", content });
    setTimeout(() => {
      worker.terminate();
      rej(new WorkerTimeoutError());
    }, 100);
    worker.onmessage = function (e) {
      switch (e.data.action) {
        case "result":
          res(e.data.result);
          break;
        case "error":
          rej(e.data.error);
          break;
        default:
          rej(new UnknownWorkerResponseError());
      }
    };
  });
}
