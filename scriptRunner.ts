import { Effect } from "effect";

export class ScriptRunnerError {
  readonly _tag = "ScriptRunnerError";
}

interface ScriptRunnerParameters {
  packageName: string;
  scriptName: string;
  directory: string;
  onExit: () => void;
  restArgs?: string[];
}

export const scriptRunner = ({
  packageName,
  scriptName,
  directory,
  onExit,
  restArgs = [],
}: ScriptRunnerParameters) =>
  Effect.try({
    try: () => {
      const proc = Bun.spawn(
        ["yarn", "workspace", packageName, scriptName, ...restArgs],
        {
          cwd: directory,
          stdio: ["inherit", "inherit", "inherit"],
          onExit,
        },
      );

      process.on("SIGINT", () => {
        proc.kill();

        onExit();
      });
    },
    catch: () => new ScriptRunnerError(),
  });
