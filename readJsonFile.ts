import { Effect } from "effect";
import { FileSystem } from "./FileSystem";

// class ReadJsonFileError {
//   readonly _tag = "ReadJsonFileError";
// }

// export const readJsonFile = (path: string) =>
//   pipe(
//     Effect.tryPromise({
//       try: () => {
//         const file = Bun.file(path);
//
//         return file.text();
//       },
//       catch: () => {
//         return new ReadJsonFileError();
//       },
//     }),
//   );

export const readJsonFile = (path: string) =>
  FileSystem.pipe(Effect.flatMap((fileSystem) => fileSystem.readFile(path)));
