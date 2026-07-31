import { useEffect, useState } from 'react'
import { useAppStore } from '../store'

/**
 * Current conditions for the header readout.
 *
 * Source is **Open-Meteo**: free, CORS-enabled, and — the deciding property —
 * keyless. This app is a static SPA on GitHub Pages, so any API key would ship
 * in the bundle for anyone to read; a provider that needs one cannot be used
 * here honestly.
 *
 * Everything degrades to `null`, which renders nothing. A missing weather
 * reading is not worth an error state in a page header: if permission is
 * refused, the network is down, or the service is unreachable, the rest of the
 * band carries on as if the widget were never there.
 */

/** WMO weather interpretation codes, grouped into the conditions worth naming. */
export type Condition =
  | 'clear'
  | 'partly'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'showers'
  | 'snow'
  | 'thunder'

export interface Weather {
  /** Degrees Celsius, rounded. SI only — see the units rule in CLAUDE.md. */
  tempC: number
  condition: Condition
}

function toCondition(code: number): Condition {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partly'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'showers'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'overcast'
}

const TTL_MS = 15 * 60 * 1000

/**
 * Module-level cache, deliberately not per-component state.
 *
 * `HeaderStatus` is rendered by `PageFrame`, so it unmounts and remounts on
 * every route change. Without a cache out here, moving between pages would hit
 * the network each time — for a number that changes a few times an hour.
 */
let cache: { key: string; at: number; value: Weather } | null = null
let inFlight: Promise<Weather | null> | null = null

async function fetchWeather(lat: number, lon: number): Promise<Weather | null> {
  // Two decimal places is ~1km — precise enough for a temperature, and it means
  // the app never sends a sharper fix than the reading actually needs.
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  if (cache && cache.key === key && Date.now() - cache.at < TTL_MS) return cache.value
  if (inFlight) return inFlight

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&current=temperature_2m,weather_code`

  inFlight = (async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      const json = (await res.json()) as {
        current?: { temperature_2m?: number; weather_code?: number }
      }
      const temp = json.current?.temperature_2m
      const code = json.current?.weather_code
      if (typeof temp !== 'number' || typeof code !== 'number') return null
      const value: Weather = { tempC: Math.round(temp), condition: toCondition(code) }
      cache = { key, at: Date.now(), value }
      return value
    } catch {
      return null
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

/**
 * Coordinates, asked for at most once per person.
 *
 * The store's `weatherAsked` flag is what makes that true: it is set on the
 * *attempt*, so a refusal is remembered as firmly as an allow and the browser
 * prompt never comes back on a later page load.
 */
function useCoords(): { lat: number; lon: number } | null {
  const coords = useAppStore((s) => s.weatherCoords)
  const asked = useAppStore((s) => s.weatherAsked)
  const setCoords = useAppStore((s) => s.setWeatherCoords)

  useEffect(() => {
    if (asked || coords) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setCoords(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      // Denied, unavailable, or timed out all land here and are recorded the
      // same way: asked, no coordinates, widget stays hidden.
      () => setCoords(null),
      { timeout: 10_000, maximumAge: 30 * 60 * 1000 },
    )
  }, [asked, coords, setCoords])

  return coords
}

/** Current conditions, or `null` while unknown/unavailable. */
export function useWeather(): Weather | null {
  const coords = useCoords()
  const [weather, setWeather] = useState<Weather | null>(() => cache?.value ?? null)

  useEffect(() => {
    if (!coords) return
    let alive = true
    const load = () => {
      fetchWeather(coords.lat, coords.lon).then((w) => {
        if (alive && w) setWeather(w)
      })
    }
    load()
    // Refresh on the same cadence as the cache, so a tab left open overnight
    // isn't still showing yesterday evening's temperature.
    const id = window.setInterval(load, TTL_MS)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [coords])

  return weather
}
