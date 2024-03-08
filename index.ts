import { Console, Effect, Fiber, pipe, ReadonlyArray } from "effect";
import { getPackages } from "./getPackages.ts";
import { packageSelector } from "./packageSelector.ts";
import { scriptRunner } from "./scriptRunner.ts";
import { discoverPackageScripts } from "./discoverPackageScripts.ts";
import { filterPackagesHasTheScript } from "./filterPackagesHasTheScript.ts";
import { sortByUsageAndName } from "./sortByUsageAndName.ts";
import { getPWD } from "./getPWD.ts";
import { installPackages } from "./installPackages.ts";

const usageMap = new Map<string, number>([
  ["dev:storybook", 1],
  ["dev:editor", 1],
]);

class NoPackagesSelectedError {
  readonly _tag = "NoPackagesSelectedError";
}

const program = Effect.gen(function* (_) {
  const runningDirectory = yield* _(getPWD);

  const [scriptName] = import.meta.env["ARGS"]?.slice(2) ?? ["dev"];

  const dependencyInstaller = yield* _(
    Effect.fork(installPackages(runningDirectory)),
  );

  const packages = yield* _(getPackages(runningDirectory));

  const selectedPackages = yield* _(
    pipe(
      packages,
      discoverPackageScripts(runningDirectory),
      Effect.map(
        ReadonlyArray.map((p) => ({
          ...p,
          usage: usageMap.get(`${scriptName}:${p.name}`) ?? 0,
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

Effect.runPromise(
  program.pipe(
    Effect.catchAll((cause) => {
      switch (cause._tag) {
        case "NoPackagesSelectedError":
          return Console.log("No packages selected");
        case "DiscoverPackagesError":
          return Console.log("Error discovering packages");
        case "InstallPackagesError":
          return Console.log("Error installing packages");
        case "ScriptRunnerError":
          return Console.log("Error running scripts");
        case "InvalidJsonError":
          return Console.log("Invalid JSON");
        default:
          return Console.log("Unknown error");
      }
    }),
  ),
).then(console.log, console.error);
