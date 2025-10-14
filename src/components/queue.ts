import PQueue from "p-queue";

if (!global._sharedQueue) {
  global._sharedQueue = new PQueue({
    concurrency: parseInt(process.env.P_QUEUE_CONCURRENCY_COUNT || "2"),
  });
}

const queue: PQueue = global._sharedQueue;

export default queue;
