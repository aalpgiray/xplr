import { Effect, pipe } from "effect";

class InvalidVariableError {
  readonly _tag = "InvalidVariableError";
  readonly message: string;

  constructor(readonly variableName: string) {
    this.message = `Environment variable ${variableName} does not exist`;
  }
}

export class FileReadError {
  readonly _tag = "FileReadError";
  readonly message: string;

  constructor(readonly path: string) {
    this.message = `Failed to read file at path: ${path}`;
  }
}

export const getEnvVariable = (variableName: string) =>
  pipe(
    Effect.fromNullable(import.meta.env[variableName]),
    Effect.catchAll(() => Effect.fail(new InvalidVariableError(variableName))),
  );
