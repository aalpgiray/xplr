import { Effect } from "effect";

import { PackageManager } from "./PackageManager";

export class InstallPackagesError {
  readonly _tag = "InstallPackagesError";
}

export const installPackages = (directory: string) =>
  PackageManager.pipe(
    Effect.flatMap((packageManager) => packageManager.install(directory)),
  );
