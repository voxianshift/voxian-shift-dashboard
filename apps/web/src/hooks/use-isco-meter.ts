"use client"

import { useEffect, useState } from "react"
import { iscoMeterModel, type IscoMeterModel } from "@/lib/isco-meter"

export function useIscoMeter(code: string, title: string, enabled: boolean) {
  const key = JSON.stringify([code, title])
  const [state, setState] = useState<{
    key: string
    result: IscoMeterModel | "missing"
  } | null>(null)
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    fetch(`/api/occupations/${code}/meter`, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(65_000)]),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: unknown) => {
        const result = iscoMeterModel(data, code, title)
        if (!controller.signal.aborted) setState({ key, result })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, result: "missing" })
      })
    return () => controller.abort()
  }, [code, title, enabled, key])
  return enabled && state?.key === key ? state.result : null
}
