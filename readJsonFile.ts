import { Effect } from "effect";
import { FileSystem } from "./FileSystem";

export const readJsonFile = (path: string) =>
  FileSystem.pipe(Effect.flatMap((fileSystem) => fileSystem.readFile(path)));
