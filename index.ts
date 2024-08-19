import { Effect, Layer, pipe } from "effect";

import { yarn } from "./PackageManager/yarn.ts";
import { bunFileSystem } from "./FileSystem/bunFileSystem.ts";
import { xplr } from "./xplr.ts";

const context = Layer.merge(yarn, bunFileSystem);

const productionProgram = Effect.provide(
  pipe(
    xplr,
    Effect.catchTags({
      DiscoverPackagesError: () => {
        return Effect.succeed("Failed to discover packages");
      },
      FileReadError: (error) => {
        return Effect.succeed(error.message);
      },
      FileWriteError: (error) => {
        return Effect.succeed(error.message);
      },
      InstallPackagesError: () => {
        return Effect.succeed("Failed to install packages");
      },
      InvalidJsonError: () => {
        return Effect.succeed("Invalid package.json");
      },
      InvalidVariableError: (error) => {
        return Effect.succeed(error.message);
      },
      NoPackagesSelectedError: () => {
        return Effect.succeed("No packages selected");
      },
      ParseError: () => {
        return Effect.succeed("Failed to parse package.json");
      },
      ScriptRunnerError: () => {
        return Effect.succeed("Failed to run script");
      },
    }),
  ),
  context,
);

Effect.runPromise(productionProgram).then(console.log, console.error);
