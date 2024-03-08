import checkbox from "@inquirer/checkbox";
import { Effect, pipe } from "effect";

export interface Selectable {
  name: string;
  value: string;
}

export const packageSelector = <T extends Selectable>(packages: T[]) =>
  pipe(
    Effect.promise(() =>
      checkbox({
        message: "Select packages to run the script",
        choices: packages.map((pkg) => ({
          name: pkg.name,
          value: pkg.value,
        })),
      }),
    ),
    Effect.map((result) =>
      packages.filter((pkg) => result.includes(pkg.value)),
    ),
  );
