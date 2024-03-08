export const filterPackagesHasTheScript =
  <T extends { scripts: Record<string, string> }>(scriptName: string) =>
  (packagesWithScripts: T[]): T[] => {
    return packagesWithScripts.filter(
      (p) => p.scripts[scriptName] !== undefined,
    );
  };
