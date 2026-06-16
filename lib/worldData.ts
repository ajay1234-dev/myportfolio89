import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'

let cachedLand: GeoJSON.FeatureCollection | null = null
let cachedCountries: GeoJSON.FeatureCollection | null = null

export async function getWorldData() {
  if (cachedLand) return { land: cachedLand, countries: cachedCountries }
  
  const res = await fetch(
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
  )
  const topo = await res.json() as Topology
  
  cachedLand = feature(topo, topo.objects.land) as GeoJSON.FeatureCollection
  cachedCountries = feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection
  
  return { land: cachedLand, countries: cachedCountries }
}
