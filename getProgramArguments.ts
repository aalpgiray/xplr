import { Effect, pipe } from "effect";

export function getProgramArguments() {
  return pipe(
    Effect.fromNullable(Bun.argv),
    Effect.tryMap({
      try: (v) => {
        const args = v.slice(2);

        if (args.length === 0) {
          throw new Error("No script name provided");
        }

        return args;
      },
      catch: () => Effect.fail(new Error("No script name provided")),
    }),
    Effect.orElse(() => Effect.succeed(["dev"])),
  );
}
