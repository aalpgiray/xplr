import { Effect } from "effect";

class InstallPackagesError {
  readonly _tag = "InstallPackagesError";
}

export const installPackages = (directory: string) =>
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
  });
