import { FileReadError, FileSystem, FileWriteError } from "./index.ts";
import { Effect, Layer } from "effect";

export const bunFileSystem = Layer.succeed(
  FileSystem,
  FileSystem.of({
    readFile: (path: string) => {
      return Effect.tryPromise({
        try: () => {
          const file = Bun.file(path);
          return file.text();
        },
        catch: () => {
          return new FileReadError(path);
        },
      });
    },
    writeFile: (path: string, content: string) => {
      return Effect.tryPromise({
        try: () => {
          return Bun.write(path, content);
        },
        catch: () => new FileWriteError(path),
      });
    },
  }),
);
