import type { Package } from "./PackageManager";
import { Effect } from "effect";
import { scriptRunner } from "./scriptRunner.ts";

export function runSelectedScriptsInParallel(
  selectedPackages: Package[],
  scriptName: string,
  runningDirectory: string,
  restArgs: string[],
  linkupsCleaners: (() => void)[],
) {
  return Effect.all(
    selectedPackages.map((s) =>
      scriptRunner({
        packageName: s.value,
        scriptName,
        directory: runningDirectory,
        restArgs,
        onExit: () => {
          linkupsCleaners.forEach((cleaner) => cleaner());
        },
      }),
    ),
    {
      concurrency: "unbounded",
    },
  );
}
