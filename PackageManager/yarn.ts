import { Effect, Layer } from "effect";
import { InstallPackagesError } from "../installPackages.ts";
import { PackageManager } from "./index.ts";
import { DiscoverPackagesError } from "../getPackages.ts";

export const yarn = Layer.succeed(
  PackageManager,
  PackageManager.of({
    install: (directory) =>
      Effect.tryPromise({
        try: () => {
          const proc = Bun.spawn(["yarn", "install"], {
            cwd: directory,
            stdio: ["pipe", "pipe", "pipe"],
          });

          process.on("SIGINT", () => {
            proc.kill();
          });

          return new Response(proc.stdout).text();
        },
        catch: () => new InstallPackagesError(),
      }),
    discoverWorkspacePackages: (directory) =>
      Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawnSync(["yarn", "workspaces", "list", "--json"], {
            cwd: directory,
          });

          const result = await new Response(proc.stdout).text();

          const lines = result.split("\n");

          return lines
            .filter((a) => a)
            .map((line) => JSON.parse(line))
            .map<{ name: string; value: string; location: string }>((a) => ({
              name: a.name.replace("@mentimeter/", ""),
              value: a.name,
              location: a.location,
            }));
        },
        catch: () => new DiscoverPackagesError(),
      }),
  }),
);
