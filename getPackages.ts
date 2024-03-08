import { $ } from "bun";
import { Effect } from "effect";

class DiscoverPackagesError {
  readonly _tag = "DiscoverPackagesError";
}

const discoverPackages = async (directory: string) => {
  const lines = await Array.fromAsync(
    $`yarn workspaces list --json`.cwd(directory).lines(),
  );

  return lines
    .filter((a) => a)
    .map((line) => JSON.parse(line))
    .map<{ name: string; value: string; location: string }>((a) => ({
      name: a.name.replace("@mentimeter/", ""),
      value: a.name,
      location: a.location,
    }));
};

export const getPackages = (directory: string) =>
  Effect.tryPromise({
    try: () => discoverPackages(directory),
    catch: () => new DiscoverPackagesError(),
  });
