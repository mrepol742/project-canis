import cliProgress from "cli-progress";

export default function LoadingBar(
  format: string = "Loading | {bar} | {value}%",
): cliProgress.SingleBar {
  return new cliProgress.SingleBar(
    {
      format,
      barCompleteChar: "█",
      barIncompleteChar: "-",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );
}
