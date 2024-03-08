import { Effect, pipe } from "effect";

class ReadJsonFileError {
  readonly _tag = "ReadJsonFileError";
}

export const readJsonFile = (path: string) =>
  pipe(
    Effect.tryPromise({
      try: () => {
        const file = Bun.file(path);

        return file.text();
      },
      catch: () => {
        return new ReadJsonFileError();
      },
    }),
  );
