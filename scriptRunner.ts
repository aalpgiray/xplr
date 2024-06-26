import { Effect } from "effect";

export class ScriptRunnerError {
  readonly _tag = "ScriptRunnerError";
}

interface ScriptRunnerParameters {
  packageName: string;
  scriptName: string;
  directory: string;
  restArgs?: string[];
}

export const scriptRunner = ({
  packageName,
  scriptName,
  directory,
  restArgs = [],
}: ScriptRunnerParameters) =>
  Effect.try({
    try: () => {
      Bun.spawn(["linkup", "local", packageName], {
        cwd: directory,
        stdio: ["ignore", "ignore", "ignore"],
      });

      const revertLocalLink = () => {
        Bun.spawn(["linkup", "remote", packageName], {
          cwd: directory,
          stdio: ["ignore", "ignore", "ignore"],
        });
      };

      const proc = Bun.spawn(
        ["yarn", "workspace", packageName, scriptName, ...restArgs],
        {
          cwd: directory,
          stdio: ["inherit", "inherit", "inherit"],
          onExit: () => {
            revertLocalLink();
          },
        },
      );

      process.on("SIGINT", () => {
        proc.kill();

        revertLocalLink();
      });
    },
    catch: () => new ScriptRunnerError(),
  });
