import { Console, Effect, Fiber, Layer, pipe, ReadonlyArray } from "effect";
import { getPackages } from "./getPackages.ts";
import { packageSelector } from "./packageSelector.ts";
import { scriptRunner } from "./scriptRunner.ts";
import { discoverPackageScripts } from "./discoverPackageScripts.ts";
import { filterPackagesHasTheScript } from "./filterPackagesHasTheScript.ts";
import { sortByUsageAndName } from "./sortByUsageAndName.ts";
import { getEnvVariable } from "./getEnvVariable.ts";
import { installPackages } from "./installPackages.ts";

import { yarn } from "./PackageManager/yarn.ts";
import { bunFileSystem } from "./FileSystem/bunFileSystem.ts";
import { readUserPreference } from "./readUserPreference.ts";
import { writeJsonFile } from "./writeJsonFile.ts";

class NoPackagesSelectedError {
  readonly _tag = "NoPackagesSelectedError";
}

const program = Effect.gen(function* (_) {
  const runningDirectory = yield* _(getEnvVariable("PWD"));
  const homeDirectory = yield* _(
    pipe(
      getEnvVariable("HOME"),
      Effect.orElse(() => getEnvVariable("USERPROFILE")),
    ),
  );

  const [scriptName] = yield* _(
    pipe(
      getEnvVariable("ARGS"),
      Effect.map((v) => v.slice(2)),
      Effect.orElse(() => Effect.succeed(["dev"])),
    ),
  );

  const configPath = `${homeDirectory}/.xplrc`;

  const packages = yield* _(getPackages(runningDirectory));

  const dependencyInstaller = yield* _(
    Effect.fork(installPackages(runningDirectory)),
  );

  const userPreference = yield* _(
    pipe(readUserPreference(configPath)),
    Effect.orElse(() => Effect.succeed(new Map<string, number>())),
  );

  const selectedPackages = yield* _(
    pipe(
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
    ),
  );

  if (selectedPackages.length === 0) {
    yield* _(Effect.fail(new NoPackagesSelectedError()));
  }

  yield* _(
    pipe(
      Effect.all([
        Console.log("Installing packages..."),
        Fiber.join(dependencyInstaller),
      ]),
      Effect.tap(([_, log]) => Console.log(log)),
      Effect.tap(() => Console.log("Packages installed")),
    ),
  );

  yield* _(
    pipe(
      Effect.succeed(userPreference),
      Effect.map((preference) => {
        selectedPackages.forEach((s) => {
          const preferenceName = `${scriptName}:${s.name}`;
          preference.set(
            preferenceName,
            (preference.get(preferenceName) ?? 0) + 1,
          );
        });

        return preference;
      }),
      Effect.tap((preference) =>
        writeJsonFile({
          data: JSON.stringify([...preference]),
          path: configPath,
        }),
      ),
    ),
  );

  yield* _(
    Effect.all(
      selectedPackages.map((s) =>
        scriptRunner({
          packageName: s.value,
          scriptName,
          directory: runningDirectory,
        }),
      ),
      {
        concurrency: "unbounded",
      },
    ),
  );

  return `Running scripts for ${selectedPackages.map((s) => s.name).join(", ")}`;
});

const recoveredProgram = program.pipe(
  Effect.catchTags({
    InvalidVariableError: (error) => {
      return Effect.succeed(error.message);
    },
    FileReadError: (error) => {
      return Effect.succeed(error.message);
    },
    FileWriteError: (error) => {
      return Effect.succeed(error.message);
    },
    ParseError: () => {
      return Effect.succeed("Failed to parse package.json");
    },
    NoPackagesSelectedError: () => {
      return Effect.succeed("No packages selected");
    },
    DiscoverPackagesError: () => {
      return Effect.succeed("Failed to discover packages");
    },
    ScriptRunnerError: () => {
      return Effect.succeed("Failed to run script");
    },
    InstallPackagesError: () => {
      return Effect.succeed("Failed to install packages");
    },
    InvalidJsonError: () => {
      return Effect.succeed("Invalid package.json");
    },
  }),
);

const context = Layer.merge(yarn, bunFileSystem);

const productionProgram = Effect.provide(recoveredProgram, context);

Effect.runPromise(productionProgram).then(console.log, console.error);
