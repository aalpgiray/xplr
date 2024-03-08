import { Effect, pipe } from "effect";

class WriteToHomeDirectoryError {
  readonly _tag = "WriteToHomeDirectoryError";
}

interface WriteToFileParameters {
  data: string;
  path: string;
}

export const writeJsonFile = ({ data, path }: WriteToFileParameters) => {
  return pipe(
    Effect.tryPromise({
      try: () => Bun.write(path, data),
      catch: () => Effect.fail(new WriteToHomeDirectoryError()),
    }),
  );
};
