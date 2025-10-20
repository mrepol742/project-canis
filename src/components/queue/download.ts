import PQueue from "p-queue";

declare global {
  var _sharedQueue: PQueue;
}

if (!global._sharedQueue) {
  global._sharedQueue = new PQueue({
    concurrency: parseInt(process.env.P_QUEUE_CONCURRENCY_COUNT || "2"),
  });
}

const queue = global._sharedQueue;

export default queue;
