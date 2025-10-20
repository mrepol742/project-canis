import PQueue from "p-queue";

declare global {
  var _sharedQueue: PQueue;
}

if (!global._sharedQueue) {
  global._sharedQueue = new PQueue({
    // a user can only react 1 message at a time
    // else its a bot
    concurrency: 1,
  });
}

const queue = global._sharedQueue;

export default queue;
