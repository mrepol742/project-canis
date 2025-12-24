import log from "npmlog";
import { NODE_ENV } from "../../config";

if (NODE_ENV === "production") {
  const methodsToPatch = ["error", "warn"];

  for (const method of methodsToPatch) {
    const original = log[method].bind(log);

    log[method] = function (prefix: string, ...args: any[]) {
      const formattedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}`;
        }
        return arg;
      });

      return original(prefix, ...formattedArgs);
    };
  }
}

export default log;
