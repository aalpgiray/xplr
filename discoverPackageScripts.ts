import { Effect, pipe } from "effect";
import { readJsonFile } from "./readJsonFile.ts";
import { parsePackageJson } from "./parsePackageJson.ts";

export const discoverPackageScripts =
  (runningDirectory: string) =>
  (
    packages: {
      location: string;
      name: string;
      value: string;
    }[],
  ) => {
    return Effect.all(
      packages.map((p) =>
        pipe(
          readJsonFile(`${runningDirectory}/${p.location}/package.json`),
          Effect.flatMap((json) => parsePackageJson(json)),
          Effect.map(({ scripts }) => ({ ...p, scripts })),
        ),
      ),
    );
  };
