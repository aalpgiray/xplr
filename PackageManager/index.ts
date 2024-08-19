import { Context, Effect } from "effect";
import { InstallPackagesError } from "../installPackages.ts";
import { DiscoverPackagesError } from "../getPackages.ts";

export interface Package {
  name: string;
  value: string;
  location: string;
}

export class PackageManager extends Context.Tag("PackageManager")<
  PackageManager,
  {
    readonly install: (
      directory: string,
    ) => Effect.Effect<string, InstallPackagesError, never>;
    readonly discoverWorkspacePackages: (
      directory: string,
    ) => Effect.Effect<Package[], DiscoverPackagesError, never>;
  }
>() {}
