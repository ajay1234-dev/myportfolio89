export const dataLinks = [
  // Transatlantic
  {
    id: "use-euw",
    from: "us-east",
    to: "eu-west",
    color: "#5B6EFF",
    speed: 0.00042,      // packet travel speed
    packets: 3,          // simultaneous packets
    latency: "72ms",
    traffic: "HIGH",
    trafficAlpha: 1.0
  },
  // Trans-Pacific
  {
    id: "usw-apne",
    from: "us-west",
    to: "ap-northeast",
    color: "#00E5A0",
    speed: 0.00038,
    packets: 2,
    latency: "108ms",
    traffic: "HIGH",
    trafficAlpha: 1.0
  },
  // Europe to Asia
  {
    id: "euw-aps",
    from: "eu-west",
    to: "ap-south",
    color: "#F5A623",
    speed: 0.00045,
    packets: 2,
    latency: "114ms",
    traffic: "MED",
    trafficAlpha: 0.75
  },
  // Europe Central to Asia
  {
    id: "euc-apse",
    from: "eu-central",
    to: "ap-southeast",
    color: "#A855F7",
    speed: 0.00040,
    packets: 2,
    latency: "140ms",
    traffic: "MED",
    trafficAlpha: 0.75
  },
  // Asia Pacific links
  {
    id: "aps-apse",
    from: "ap-south",
    to: "ap-southeast",
    color: "#00CFFF",
    speed: 0.00055,
    packets: 3,
    latency: "38ms",
    traffic: "HIGH",
    trafficAlpha: 1.0
  },
  {
    id: "apse-apne",
    from: "ap-southeast",
    to: "ap-northeast",
    color: "#FFD700",
    speed: 0.00050,
    packets: 2,
    latency: "52ms",
    traffic: "MED",
    trafficAlpha: 0.75
  },
  // Americas
  {
    id: "use-sae",
    from: "us-east",
    to: "sa-east",
    color: "#FF8C00",
    speed: 0.00048,
    packets: 2,
    latency: "120ms",
    traffic: "LOW",
    trafficAlpha: 0.5
  },
  // US cross-country
  {
    id: "use-usw",
    from: "us-east",
    to: "us-west",
    color: "#5B6EFF",
    speed: 0.00060,
    packets: 3,
    latency: "65ms",
    traffic: "HIGH",
    trafficAlpha: 1.0
  },
  // Europe internal
  {
    id: "euw-euc",
    from: "eu-west",
    to: "eu-central",
    color: "#FF4D6D",
    speed: 0.00065,
    packets: 2,
    latency: "18ms",
    traffic: "HIGH",
    trafficAlpha: 1.0
  },
  // Africa/Middle East
  {
    id: "euc-aps",
    from: "eu-central",
    to: "ap-south",
    color: "#A855F7",
    speed: 0.00044,
    packets: 2,
    latency: "96ms",
    traffic: "LOW",
    trafficAlpha: 0.5
  }
]
