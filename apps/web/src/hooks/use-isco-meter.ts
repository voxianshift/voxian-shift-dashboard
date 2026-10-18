"use client"

import { useEffect, useState } from "react"
import { baselineIdForOccupation, occupationCode, type CareerProfile } from "@voxian/shared"
import { iscoMeterModel, type IscoMeterModel } from "@/lib/isco-meter"

type Result = IscoMeterModel | "missing"
// One request per occupation per visit: the post-onboarding warm-up fills this, so Meter,
// Methodology and the baseline step render from it instead of fetching again.
const pending = new Map<string, Promise<Result>>()
const resolved = new Map<string, Result>()

export function prefetchIscoMeter(code: string, title: string): Promise<Result> {
  const key = JSON.stringify([code, title])
  let request = pending.get(key)
  if (!request) {
    request = fetch(`/api/occupations/${code}/meter`, { signal: AbortSignal.timeout(65_000) })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: unknown) => iscoMeterModel(data, code, title))
      .catch(() => "missing" as const)
      .then((result) => {
        resolved.set(key, result)
        // Let a failed lookup be retried on the next visit to the page.
        if (result === "missing") pending.delete(key)
        return result
      })
    pending.set(key, request)
  }
  return request
}

/** Warm the Meter for a profile; demonstration baselines are bundled and need no request. */
export async function prefetchProfileMeter(profile: CareerProfile) {
  const code = occupationCode(profile.primaryOccupation)
  if (code && !baselineIdForOccupation(code))
    await prefetchIscoMeter(code, profile.occupationNames[code] ?? "")
}

export function useIscoMeter(code: string, title: string, enabled: boolean) {
  const key = JSON.stringify([code, title])
  const [state, setState] = useState<{ key: string; result: Result } | null>(() => {
    const cached = resolved.get(key)
    return cached ? { key, result: cached } : null
  })
  useEffect(() => {
    if (!enabled) return
    let active = true
    void prefetchIscoMeter(code, title).then((result) => {
      if (active) setState({ key, result })
    })
    return () => {
      active = false
    }
  }, [code, title, enabled, key])
  return enabled && state?.key === key ? state.result : null
}
