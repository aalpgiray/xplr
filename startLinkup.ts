import { Effect } from "effect";
import { ScriptRunnerError } from "./scriptRunner.ts";

export const startLinkup = ({
  packageName,
  directory,
}: {
  packageName: string;
  directory: string;
}) =>
  Effect.tryPromise({
    try: async () => {
      const promise = new Promise<void>((resolve) =>
        Bun.spawn(["linkup", "local", packageName], {
          cwd: directory,
          stdio: ["ignore", "ignore", "ignore"],
          onExit() {
            resolve();
          },
        }),
      );

      await promise;

      return () => {
        Bun.spawn(["linkup", "remote", packageName], {
          cwd: directory,
          stdio: ["ignore", "ignore", "ignore"],
        });
      };
    },
    catch: () => new ScriptRunnerError(),
  });
