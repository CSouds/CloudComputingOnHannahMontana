// No presence API exists yet, so avoid claiming that any peer is reachable.
export async function getOnlineDeviceIds(signal?: AbortSignal): Promise<string[]> {
  signal?.throwIfAborted()
  return []
}
