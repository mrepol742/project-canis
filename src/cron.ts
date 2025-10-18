import cron from "node-cron";
import speedtestJob, { info as speedtestInfo } from "./jobs/speedtest";
import pingJob, { info as pingInfo } from "./jobs/ping";
import log from "./components/utils/log";

export interface CronJobInfo {
  /** The name of the Job */
  name: string;

  /** A brief description of what the Job does */
  description?: string;

  /** When should be the Job trigger */
  schedule: string;

  /** Optional: set to true if you want this Job to run during initialization */
  runOnStartup?: boolean;
}

interface CronJob {
  info: CronJobInfo;
  job: () => Promise<void> | void;
}

// register more cron jobin here
const jobs: CronJob[] = [
  { info: speedtestInfo, job: speedtestJob },
  { info: pingInfo, job: pingJob },
];

export function registerCronJobs() {
  for (const { info, job } of jobs) {
    cron.schedule(info.schedule, job);
    log.info(info.name, `Registered cron job on (${info.schedule})`);

    if (info.runOnStartup) {
      log.info(info.name, "Running on startup...");
      job();
    }
  }
}
