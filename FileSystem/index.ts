import { Context, Effect } from "effect";

export class FileReadError {
  readonly _tag = "FileReadError";
  readonly message: string;

  constructor(readonly path: string) {
    this.message = `Failed to read file at path: ${path}`;
  }
}

export class FileWriteError {
  readonly _tag = "FileWriteError";
  readonly message: string;

  constructor(readonly path: string) {
    this.message = `Failed to write file at path: ${path}`;
  }
}

export class FileSystem extends Context.Tag("FileSystem")<
  FileSystem,
  {
    readonly readFile: (path: string) => Effect.Effect<string, FileReadError>;
    readonly writeFile: (
      path: string,
      content: string,
    ) => Effect.Effect<void, FileWriteError>;
  }
>() {}
