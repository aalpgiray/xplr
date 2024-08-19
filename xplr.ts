import { Effect } from "effect";
import { getEnvVariable } from "./getEnvVariable.ts";
import { getUserHomeDirectory } from "./getUserHomeDirectory.ts";
import { getProgramArguments } from "./getProgramArguments.ts";
import { getPackages } from "./getPackages.ts";
import { installPackages } from "./installPackages.ts";
import { readUserPreference } from "./readUserPreference.ts";
import { getSelectedPackages } from "./getSelectedPackages.ts";
import { installDependencies } from "./installDependencies.ts";
import { updateUserPreferences } from "./updateUserPreferences.ts";
import { startLinkupForAllPackages } from "./startLinkupForAllPackages.ts";
import { runSelectedScriptsInParallel } from "./runSelectedScriptsInParallel.ts";

export const xplr = Effect.gen(function* (_) {
  const runningDirectory = yield* _(getEnvVariable("PWD"));
  const homeDirectory = yield* _(getUserHomeDirectory());
  const [scriptName, ...restArgs] = yield* _(getProgramArguments());
  const configPath = `${homeDirectory}/.xplrc`;
  const packages = yield* _(getPackages(runningDirectory));

  const dependencyInstaller = yield* _(
    Effect.fork(installPackages(runningDirectory)),
  );
  const userPreference = yield* _(readUserPreference(configPath));

  const selectedPackages = yield* _(
    getSelectedPackages(packages, runningDirectory, userPreference, scriptName),
  );

  if (selectedPackages.length === 0) {
    yield* _(Effect.fail(new NoPackagesSelectedError()));
  }

  yield* _(installDependencies(dependencyInstaller));

  yield* _(
    updateUserPreferences(
      userPreference,
      selectedPackages,
      scriptName,
      configPath,
    ),
  );

  const linkupsCleaners = yield* _(
    startLinkupForAllPackages(selectedPackages, runningDirectory),
  );

  yield* _(
    runSelectedScriptsInParallel(
      selectedPackages,
      scriptName,
      runningDirectory,
      restArgs,
      linkupsCleaners,
    ),
  );

  return `Running scripts for ${selectedPackages.map((s) => s.name).join(", ")}`;
});

class NoPackagesSelectedError {
  readonly _tag = "NoPackagesSelectedError";
}
