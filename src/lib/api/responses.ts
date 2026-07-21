export function ok<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

export function fail(error: string, status: number): Response {
  return Response.json({ error }, { status });
}
