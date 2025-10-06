import cron from "node-cron";
import speedtestJob, { info as speedtestInfo } from "./jobs/speedtest";
import log from "./components/utils/log";

interface CronJobInfo {
  name: string;
  description?: string;
  schedule: string;
  runOnStartup?: boolean;
}

interface CronJob {
  info: CronJobInfo;
  job: () => Promise<void> | void;
}

// register more cron jobin here
const jobs: CronJob[] = [{ info: speedtestInfo, job: speedtestJob }];

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
