import type { Package } from "./PackageManager";
import { Effect } from "effect";
import { startLinkup } from "./startLinkup.ts";

export function startLinkupForAllPackages(
  selectedPackages: Package[],
  runningDirectory: string,
) {
  return Effect.all(
    selectedPackages.map((s) =>
      startLinkup({
        packageName: s.value,
        directory: runningDirectory,
      }),
    ),
  );
}
