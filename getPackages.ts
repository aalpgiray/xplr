import { Effect } from "effect";
import { PackageManager } from "./PackageManager";

export class DiscoverPackagesError {
  readonly _tag = "DiscoverPackagesError";
}

export const getPackages = (directory: string) =>
  PackageManager.pipe(
    Effect.flatMap((packageManager) =>
      packageManager.discoverWorkspacePackages(directory),
    ),
  );
