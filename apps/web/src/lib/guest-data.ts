export async function guestRequest(resource: string, method = "GET", body?: unknown) {
  const response = await fetch(`/api/guest/${resource}`, {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    ...(body !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      : {}),
  })
  if (response.status === 204) return {}
  const result = await response.json()
  if (!response.ok)
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Your saved data is unavailable. Try again.",
    )
  return result
}
