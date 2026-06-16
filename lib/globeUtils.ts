// Convert geographic lat/lng to 3D sphere point
// then project onto 2D canvas with rotation
export function geoProject(
  lat: number,
  lng: number,
  rotationLng: number,  // current Y rotation in degrees
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number; visible: boolean; depth: number } {
  // Convert to radians
  const latR = (lat * Math.PI) / 180
  const lngR = ((lng + rotationLng) * Math.PI) / 180

  // 3D sphere coordinates
  const x3 = Math.cos(latR) * Math.sin(lngR)
  const y3 = -Math.sin(latR)
  const z3 = Math.cos(latR) * Math.cos(lngR)

  return {
    x: cx + radius * x3,
    y: cy + radius * y3,
    visible: z3 > -0.1,
    depth: z3   // -1 to 1, 1 = facing viewer
  }
}

// Load world atlas GeoJSON land polygons
export async function loadWorldData() {
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
  )
  const topology = await response.json()
  const { feature } = await import('topojson-client')
  const countries: unknown = feature(topology, topology.objects.countries)
  const land: unknown = feature(topology, topology.objects.land)
  return { countries, land }
}

// Project a GeoJSON coordinate pair onto canvas
// Returns project result
export function projectCoord(
  coord: [number, number],
  rotationLng: number,
  cx: number,
  cy: number,
  radius: number
) {
  return geoProject(coord[1], coord[0], rotationLng, cx, cy, radius)
}

// Draw a rounded rectangle on canvas
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
