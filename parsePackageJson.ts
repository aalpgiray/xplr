import * as S from "@effect/schema/Schema";
import { Effect, pipe } from "effect";

class InvalidJsonError {
  readonly _tag = "InvalidJsonError";
}

const PackageJson = S.Struct({
  scripts: S.Record({ key: S.String, value: S.String }),
});

export const parsePackageJson = (text: string) =>
  pipe(
    Effect.try({
      try: () => JSON.parse(text),
      catch: () => new InvalidJsonError(),
    }),
    Effect.flatMap((json) => S.decode(PackageJson)(json)),
  );
