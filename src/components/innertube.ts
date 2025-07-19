import { Innertube, UniversalCache } from "youtubei.js";

let innertube: Innertube;

export default async function initInnertube(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create({
      lang: "en",
      location: "US",
      cache: new UniversalCache(true, "../../.cache"),
    });
  }
  return innertube;
}
