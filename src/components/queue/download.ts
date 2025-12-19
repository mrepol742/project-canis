import PQueue from "p-queue";
import { P_QUEUE_CONCURRENCY_COUNT } from "../../config";

declare global {
  var _sharedQueue: PQueue;
}

if (!global._sharedQueue) {
  global._sharedQueue = new PQueue({
    concurrency: P_QUEUE_CONCURRENCY_COUNT,
  });
}

const queue = global._sharedQueue;

export default queue;
