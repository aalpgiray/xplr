import type { Package } from "./PackageManager";
import { Effect, pipe } from "effect";
import { writeJsonFile } from "./writeJsonFile.ts";

export function updateUserPreferences(
  userPreference: Map<string, number>,
  selectedPackages: Package[],
  scriptName: string,
  configPath: string,
) {
  return pipe(
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
  );
}
