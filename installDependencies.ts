import { Console, Effect, Fiber, pipe } from "effect";
import { InstallPackagesError } from "./installPackages.ts";

export function installDependencies(
  dependencyInstaller: Fiber.RuntimeFiber<string, InstallPackagesError>,
) {
  return pipe(
    Effect.all([
      Console.log("Installing packages..."),
      Fiber.join(dependencyInstaller),
    ]),
    Effect.tap(([_, log]) => Console.log(log)),
    Effect.tap(() => Console.log("Packages installed")),
  );
}
