import { Effect, pipe } from "effect";

class InvalidDirectoryError {
  readonly _tag = "InvalidDirectoryError";
}

export const getPWD = pipe(
  Effect.fromNullable(import.meta.env["PWD"]),
  Effect.catchAll(() => Effect.fail(new InvalidDirectoryError())),
);
