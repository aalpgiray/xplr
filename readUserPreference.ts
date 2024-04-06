import { FileSystem } from "./FileSystem";
import { Effect } from "effect";

export class UserPreferenceParsingError {
  readonly _tag = "UserPreferenceParsingError";
}

export const readUserPreference = (path: string) =>
  FileSystem.pipe(
    Effect.flatMap((fileSystem) => fileSystem.readFile(path)),
    Effect.tryMap({
      try: (content) => JSON.parse(content),
      catch: () => new UserPreferenceParsingError(),
    }),
    Effect.map((content) => new Map<string, number>(content)),
  );
