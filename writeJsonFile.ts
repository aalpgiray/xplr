import { Effect } from "effect";
import { FileSystem } from "./FileSystem";

interface WriteToFileParameters {
  data: string;
  path: string;
}

export const writeJsonFile = ({ data, path }: WriteToFileParameters) => {
  return FileSystem.pipe(
    Effect.flatMap((fileSystem) => fileSystem.writeFile(path, data)),
  );
};
