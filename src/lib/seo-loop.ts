export const seoProjectSeed = {
  slug: "seatac-core-seo",
  name: "Seatac.co Core SEO",
  description:
    "Primary SEO tracking project for route, hotel, cruise, airline, and airport-planning pages on seatac.co.",
} as const;

export const seoTrackedPagesSeed = [
  {
    url: "https://seatac.co",
    pageType: "homepage",
    keywordCluster: "brand-and-airport",
    title: "Seatac Connection | Sea-Tac airport rides and travel planning",
    metaDescription:
      "Airport-first booking and travel planning for Sea-Tac pickups, Seattle hotel transfers, Bellevue rides, and local airport guides.",
  },
  {
    url: "https://seatac.co/seatac-airport-car-service",
    pageType: "route",
    keywordCluster: "airport-routes",
  },
  {
    url: "https://seatac.co/seatac-to-bellevue",
    pageType: "route",
    keywordCluster: "eastside-routes",
  },
  {
    url: "https://seatac.co/seatac-to-downtown-seattle",
    pageType: "route",
    keywordCluster: "downtown-routes",
  },
  {
    url: "https://seatac.co/seatac-to-pier-66",
    pageType: "route",
    keywordCluster: "cruise-routes",
  },
  {
    url: "https://seatac.co/seatac-to-pier-91",
    pageType: "route",
    keywordCluster: "cruise-routes",
  },
  {
    url: "https://seatac.co/seatac-airport-hotels",
    pageType: "hotel-cluster",
    keywordCluster: "airport-hotels",
  },
  {
    url: "https://seatac.co/seatac-parking-guide",
    pageType: "planning-guide",
    keywordCluster: "airport-planning",
  },
  {
    url: "https://seatac.co/pier-66-vs-pier-91-transfer-guide",
    pageType: "comparison-guide",
    keywordCluster: "cruise-routes",
  },
  {
    url: "https://seatac.co/park-and-fly-hotels-seatac",
    pageType: "planning-guide",
    keywordCluster: "airport-hotels",
  },
  {
    url: "https://seatac.co/seatac-to/hyatt-regency-bellevue",
    pageType: "hotel-transfer",
    keywordCluster: "hotel-transfers",
  },
  {
    url: "https://seatac.co/airlines/alaska-at-seatac",
    pageType: "airline-guide",
    keywordCluster: "airline-guides",
  },
  {
    url: "https://seatac.co/arrivals",
    pageType: "airport-utility",
    keywordCluster: "airport-utilities",
  },
  {
    url: "https://seatac.co/departures",
    pageType: "airport-utility",
    keywordCluster: "airport-utilities",
  },
] as const;

export const seoTrackedKeywordsSeed = [
  {
    keyword: "seatac airport car service",
    cluster: "airport-routes",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-airport-car-service",
  },
  {
    keyword: "seatac to bellevue car service",
    cluster: "eastside-routes",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-to-bellevue",
  },
  {
    keyword: "seatac to downtown seattle",
    cluster: "downtown-routes",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-to-downtown-seattle",
  },
  {
    keyword: "seatac to pier 66",
    cluster: "cruise-routes",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-to-pier-66",
  },
  {
    keyword: "seatac to pier 91",
    cluster: "cruise-routes",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-to-pier-91",
  },
  {
    keyword: "seatac airport hotels",
    cluster: "airport-hotels",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-airport-hotels",
  },
  {
    keyword: "seatac parking",
    cluster: "airport-planning",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-parking-guide",
  },
  {
    keyword: "pier 66 vs pier 91 transfer",
    cluster: "cruise-routes",
    intent: "planning",
    targetUrl: "https://seatac.co/pier-66-vs-pier-91-transfer-guide",
  },
  {
    keyword: "seatac park and fly hotels",
    cluster: "airport-hotels",
    intent: "planning",
    targetUrl: "https://seatac.co/park-and-fly-hotels-seatac",
  },
  {
    keyword: "seatac to hyatt regency bellevue",
    cluster: "hotel-transfers",
    intent: "commercial",
    targetUrl: "https://seatac.co/seatac-to/hyatt-regency-bellevue",
  },
  {
    keyword: "alaska at seatac",
    cluster: "airline-guides",
    intent: "planning",
    targetUrl: "https://seatac.co/airlines/alaska-at-seatac",
  },
  {
    keyword: "seatac arrivals",
    cluster: "airport-utilities",
    intent: "planning",
    targetUrl: "https://seatac.co/arrivals",
  },
  {
    keyword: "seatac departures",
    cluster: "airport-utilities",
    intent: "planning",
    targetUrl: "https://seatac.co/departures",
  },
] as const;

export const seoExperimentsSeed = [
  {
    slug: "homepage-hero-clarity",
    name: "Homepage hero clarity",
    hypothesis:
      "A clearer homepage value proposition will improve internal click-through into route, hotel, and reserve pages.",
    status: "running",
    successMetric: "Homepage CTA and route-card click-through rate",
    targetUrls: ["https://seatac.co"],
    targetKeywords: ["seatac airport car service", "seatac airport hotels"],
  },
  {
    slug: "fare-first-route-pages",
    name: "Route page fare-first layout",
    hypothesis:
      "Showing fare, distance, and duration above the fold will improve route-page conversion without hurting rankings.",
    status: "planned",
    successMetric: "Route page reserve CTA click-through rate",
    targetUrls: [
      "https://seatac.co/seatac-to-bellevue",
      "https://seatac.co/seatac-to-downtown-seattle",
    ],
    targetKeywords: ["seatac to bellevue car service", "seatac to downtown seattle"],
  },
  {
    slug: "hotel-rate-context",
    name: "Hotel rate context on transfer pages",
    hypothesis:
      "Adding hotel stay context to transfer pages will improve topical relevance and planner conversion for hotel-intent traffic.",
    status: "planned",
    successMetric: "Hotel page reserve CTA click-through rate",
    targetUrls: [
      "https://seatac.co/seatac-airport-hotels",
      "https://seatac.co/seatac-to/hyatt-regency-bellevue",
    ],
    targetKeywords: ["seatac airport hotels", "seatac to hyatt regency bellevue"],
  },
] as const;

export const seoBacklogSeed = [
  {
    source: "content-gap",
    itemType: "new-page",
    title: "Sea-Tac parking guide and comparison page",
    summary:
      "Create a dedicated parking/planning page covering Sea-Tac parking options, park-and-fly decisions, and ride-vs-parking tradeoffs.",
    audience: "airport travelers",
    intent: "planning",
    priority: 92,
    suggestedUrl: "https://seatac.co/seatac-parking-guide",
    targetKeyword: "seatac parking",
  },
  {
    source: "content-gap",
    itemType: "support-article",
    title: "Park-and-fly hotel planning guide",
    summary:
      "Add a support article for park-and-fly stays, hotel shuttle alternatives, and transfer booking logic around Sea-Tac.",
    audience: "airport hotel planners",
    intent: "planning",
    priority: 78,
    suggestedUrl: "https://seatac.co/park-and-fly-hotels-seatac",
    targetKeyword: "seatac park and fly hotels",
  },
  {
    source: "faq-gap",
    itemType: "faq",
    title: "Expand arrivals and departures FAQ coverage",
    summary:
      "Add question-led content around pickup timing, bag claim walk times, evening congestion, and terminal meet points.",
    audience: "airport travelers",
    intent: "planning",
    priority: 74,
    suggestedUrl: null,
    targetKeyword: "seatac arrivals questions",
  },
  {
    source: "cluster-gap",
    itemType: "comparison-page",
    title: "Cruise transfer comparison page",
    summary:
      "Create a comparison page for Pier 66 vs Pier 91 transfer planning, downtown hotel staging, and luggage timing.",
    audience: "cruise travelers",
    intent: "planning",
    priority: 70,
    suggestedUrl: "https://seatac.co/pier-66-vs-pier-91-transfer-guide",
    targetKeyword: "pier 66 vs pier 91 transfer",
  },
] as const;
