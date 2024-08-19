import type { Package } from "./PackageManager";
import { Effect, pipe, ReadonlyArray } from "effect";
import { discoverPackageScripts } from "./discoverPackageScripts.ts";
import { filterPackagesHasTheScript } from "./filterPackagesHasTheScript.ts";
import { sortByUsageAndName } from "./sortByUsageAndName.ts";
import { packageSelector } from "./packageSelector.ts";

export function getSelectedPackages(
  packages: Package[],
  runningDirectory: string,
  userPreference: Map<string, number>,
  scriptName: string,
) {
  return pipe(
    packages,
    discoverPackageScripts(runningDirectory),
    Effect.map(
      ReadonlyArray.map((p) => ({
        ...p,
        usage: userPreference.get(`${scriptName}:${p.name}`) ?? 0,
      })),
    ),
    Effect.map(filterPackagesHasTheScript(scriptName)),
    Effect.map(sortByUsageAndName),
    Effect.flatMap(packageSelector),
  );
}
