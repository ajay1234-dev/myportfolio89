// GeoJSON coordinates are [longitude, latitude]
// rotationDeg = current globe Y rotation in degrees

export function projectPoint(
  lonDeg: number,
  latDeg: number,
  rotationDeg: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number; z: number } {
  // Apply rotation to longitude
  const lon = ((lonDeg + rotationDeg) * Math.PI) / 180
  const lat = (latDeg * Math.PI) / 180

  // Convert to 3D cartesian
  const x3 = Math.cos(lat) * Math.sin(lon)
  const y3 = -Math.sin(lat)
  const z3 = Math.cos(lat) * Math.cos(lon)

  // Project to 2D canvas
  return {
    x: cx + radius * x3,
    y: cy + radius * y3,
    z: z3   // positive = facing viewer, negative = behind
  }
}

export function isVisible(z: number): boolean {
  return z > 0
}
