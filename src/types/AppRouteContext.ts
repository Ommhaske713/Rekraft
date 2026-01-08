export type AppRouteParams = Record<string, string | string[] | undefined>;

export type AppRouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

export async function resolveRouteParams(
  context: AppRouteContext
): Promise<AppRouteParams | undefined> {
  if (!context.params) {
    return undefined;
  }

  return (await context.params) as AppRouteParams;
}
