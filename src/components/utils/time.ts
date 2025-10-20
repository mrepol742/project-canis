import { getTimezonesForCountry, Timezone } from "countries-and-timezones";
import moment from "moment-timezone";

export function getCurrentTimeByCountryCode(countryCode: string) {
  const timezones: Timezone[] | undefined = getTimezonesForCountry(
    countryCode.toUpperCase(),
  );

  if (!timezones || timezones.length === 0) {
    throw new Error("Invalid country code or no timezones found.");
  }

  const timezone = timezones[0];
  const localTime = moment().tz(timezone.name).format("YYYY-MM-DD HH:mm:ss");

  return { countryCode, timezone, localTime };
}
