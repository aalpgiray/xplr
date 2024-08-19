import { Effect, pipe } from "effect";
import { getEnvVariable } from "./getEnvVariable.ts";

export const getUserHomeDirectory = () =>
  pipe(
    getEnvVariable("HOME"),
    Effect.orElse(() => getEnvVariable("USERPROFILE")),
  );
