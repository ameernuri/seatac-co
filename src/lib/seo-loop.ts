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
    url: "https://seatac.co/seatac-airport-transfer-guide",
    pageType: "planning-guide",
    keywordCluster: "airport-routes",
  },
  {
    url: "https://seatac.co/seatac-airport-guide",
    pageType: "planning-guide",
    keywordCluster: "brand-and-airport",
  },
  {
    url: "https://seatac.co/seatac-airport-faq",
    pageType: "airport-utility",
    keywordCluster: "brand-and-airport",
  },
  {
    url: "https://seatac.co/seatac-hotel-transfer-guide",
    pageType: "planning-guide",
    keywordCluster: "hotel-transfers",
  },
  {
    url: "https://seatac.co/downtown-seattle-airport-transfer-guide",
    pageType: "planning-guide",
    keywordCluster: "downtown-routes",
  },
  {
    url: "https://seatac.co/eastside-airport-transfer-guide",
    pageType: "planning-guide",
    keywordCluster: "eastside-routes",
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
    url: "https://seatac.co/blog/seatac-parking-tips",
    pageType: "blog-post",
    keywordCluster: "airport-planning",
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
    keyword: "seatac airport transfer guide",
    cluster: "airport-routes",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-airport-transfer-guide",
  },
  {
    keyword: "seatac airport guide",
    cluster: "brand-and-airport",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-airport-guide",
  },
  {
    keyword: "seatac airport faq",
    cluster: "brand-and-airport",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-airport-faq",
  },
  {
    keyword: "seatac hotel transfer guide",
    cluster: "hotel-transfers",
    intent: "planning",
    targetUrl: "https://seatac.co/seatac-hotel-transfer-guide",
  },
  {
    keyword: "downtown seattle airport transfer guide",
    cluster: "downtown-routes",
    intent: "planning",
    targetUrl: "https://seatac.co/downtown-seattle-airport-transfer-guide",
  },
  {
    keyword: "eastside airport transfer guide",
    cluster: "eastside-routes",
    intent: "planning",
    targetUrl: "https://seatac.co/eastside-airport-transfer-guide",
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
    keyword: "seatac parking tips",
    cluster: "airport-planning",
    intent: "planning",
    targetUrl: "https://seatac.co/blog/seatac-parking-tips",
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

export const seoCoverageClusterSeed = [
  {
    cluster: "brand-and-airport",
    label: "Brand and airport orientation",
    audience: "first-time Sea-Tac travelers",
    intent: "planning",
    primaryPageTypes: ["homepage", "planning-guide"],
    supportPageTypes: ["airport-utility", "planning-guide"],
    nextSuggestedTitle: "Create support guide for airport utility pages",
    nextSuggestedUrl: "https://seatac.co/airport-utility-guide",
  },
  {
    cluster: "airport-routes",
    label: "Airport transfer routes",
    audience: "airport travelers booking rides",
    intent: "commercial",
    primaryPageTypes: ["route"],
    supportPageTypes: ["planning-guide", "comparison-guide"],
    nextSuggestedTitle: "Create support guide for airport transfer routes",
    nextSuggestedUrl: "https://seatac.co/seatac-airport-transfer-guide",
  },
  {
    cluster: "eastside-routes",
    label: "Eastside transfer routes",
    audience: "Bellevue and Eastside travelers",
    intent: "planning",
    primaryPageTypes: ["route"],
    supportPageTypes: ["planning-guide", "hotel-transfer"],
    nextSuggestedTitle: "Create support guide for Eastside transfer routes",
    nextSuggestedUrl: "https://seatac.co/eastside-airport-transfer-guide",
  },
  {
    cluster: "downtown-routes",
    label: "Downtown Seattle transfer routes",
    audience: "downtown Seattle travelers",
    intent: "planning",
    primaryPageTypes: ["route"],
    supportPageTypes: ["planning-guide", "comparison-guide"],
    nextSuggestedTitle: "Create support guide for downtown Seattle transfer routes",
    nextSuggestedUrl: "https://seatac.co/downtown-seattle-airport-transfer-guide",
  },
  {
    cluster: "cruise-routes",
    label: "Cruise transfer pages",
    audience: "cruise travelers",
    intent: "planning",
    primaryPageTypes: ["route"],
    supportPageTypes: ["comparison-guide", "planning-guide"],
    nextSuggestedTitle: "Cruise transfer comparison page",
    nextSuggestedUrl: "https://seatac.co/pier-66-vs-pier-91-transfer-guide",
  },
  {
    cluster: "airport-hotels",
    label: "Airport hotel planning pages",
    audience: "airport hotel planners",
    intent: "planning",
    primaryPageTypes: ["hotel-cluster"],
    supportPageTypes: ["planning-guide", "support-article"],
    nextSuggestedTitle: "Park-and-fly hotel planning guide",
    nextSuggestedUrl: "https://seatac.co/park-and-fly-hotels-seatac",
  },
  {
    cluster: "hotel-transfers",
    label: "Hotel transfer pages",
    audience: "hotel guests booking airport transportation",
    intent: "commercial",
    primaryPageTypes: ["hotel-transfer"],
    supportPageTypes: ["planning-guide", "hotel-cluster"],
    nextSuggestedTitle: "Create support guide for hotel transfer pages",
    nextSuggestedUrl: "https://seatac.co/seatac-hotel-transfer-guide",
  },
  {
    cluster: "airline-guides",
    label: "Airline guide pages",
    audience: "airline-specific airport planners",
    intent: "planning",
    primaryPageTypes: ["airline-guide"],
    supportPageTypes: ["planning-guide", "airport-utility"],
    nextSuggestedTitle: "Create support guide for airline guide pages",
    nextSuggestedUrl: "https://seatac.co/airline-guide",
  },
  {
    cluster: "airport-utilities",
    label: "Airport utility pages",
    audience: "travelers checking arrivals and departures",
    intent: "planning",
    primaryPageTypes: ["airport-utility"],
    supportPageTypes: ["planning-guide", "faq"],
    nextSuggestedTitle: "Create support guide for airport utility pages",
    nextSuggestedUrl: "https://seatac.co/airport-utility-guide",
  },
  {
    cluster: "airport-planning",
    label: "Airport planning pages",
    audience: "travelers planning parking and airport logistics",
    intent: "planning",
    primaryPageTypes: ["planning-guide"],
    supportPageTypes: ["comparison-guide", "support-article"],
    nextSuggestedTitle: "Sea-Tac parking guide and comparison page",
    nextSuggestedUrl: "https://seatac.co/seatac-parking-guide",
  },
] as const;

export const seoTemplateFamilySeed = [
  {
    slug: "route-page",
    label: "Route page",
    description: "Primary commercial page for a Sea-Tac transfer route with booking intent.",
    pageTypes: ["route"],
    itemTypes: ["optimize-existing-page"],
    requiredSections: [
      "route-specific headline",
      "fare or service context",
      "pickup and drop-off notes",
      "booking CTA",
      "route FAQ",
    ],
    checklist: [
      "Confirm exact route keyword in title and H1",
      "Add route-specific logistics and pickup notes",
      "Include pricing or service-selection context",
      "Add route FAQ and internal links",
    ],
    writingGuidance:
      "Lead with the exact route and commercial intent. Explain pickup flow, timing, and service expectations before supporting details.",
  },
  {
    slug: "airport-guide",
    label: "Airport guide",
    description: "Broad airport orientation page for first-time Sea-Tac travelers.",
    pageTypes: ["planning-guide", "homepage"],
    itemTypes: ["new-page"],
    requiredSections: [
      "airport overview",
      "terminal orientation",
      "ground transportation options",
      "planning FAQ",
      "next-step links",
    ],
    checklist: [
      "Cover who the page is for and when it helps",
      "Explain terminal or airport layout clearly",
      "Link to related route, parking, and utility pages",
      "Add FAQ for first-time travelers",
    ],
    writingGuidance:
      "Write for a traveler who needs orientation fast. Prioritize clarity, airport wayfinding, and next-step decisions.",
  },
  {
    slug: "airport-transfer-guide",
    label: "Airport transfer guide",
    description: "Planning-first guide for getting between Sea-Tac and common destinations.",
    pageTypes: ["planning-guide"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "who this route guide helps",
      "common destination scenarios",
      "pickup timing guidance",
      "transfer FAQ",
      "related route links",
    ],
    checklist: [
      "Clarify traveler scenario and timing pressure",
      "Explain airport pickup decision points",
      "Link to the matching commercial route pages",
      "Answer planning questions that commercial pages skip",
    ],
    writingGuidance:
      "Support commercial route pages with richer planning context, not duplicate sales copy.",
  },
  {
    slug: "neighborhood-transfer-guide",
    label: "Neighborhood transfer guide",
    description: "Support guide for neighborhood-specific airport transfer planning such as Downtown or the Eastside.",
    pageTypes: ["planning-guide"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "neighborhood overview",
      "transfer timing",
      "pickup and drop-off nuances",
      "hotel or landmark notes",
      "FAQ and next-step links",
    ],
    checklist: [
      "Describe the neighborhood traveler use case",
      "Cover arrival and departure timing patterns",
      "Mention landmark and hotel pickup nuances",
      "Link to the matching route pages",
    ],
    writingGuidance:
      "Write with local specificity. The page should feel useful to someone choosing between neighborhoods, hotels, or pickup strategies.",
  },
  {
    slug: "hotel-transfer-guide",
    label: "Hotel transfer guide",
    description: "Guide for airport-to-hotel transfers, hotel districts, and hotel pickup planning.",
    pageTypes: ["hotel-transfer", "planning-guide"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "hotel traveler scenario",
      "pickup and lobby coordination",
      "baggage and timing notes",
      "hotel-focused FAQ",
      "related hotel or route links",
    ],
    checklist: [
      "Explain hotel-specific pickup or lobby expectations",
      "Address luggage and late-arrival timing",
      "Reference airport hotels or destination hotels",
      "Add hotel-planning FAQ",
    ],
    writingGuidance:
      "Write for travelers comparing airport rides with hotel shuttles, staying overnight, or arriving late.",
  },
  {
    slug: "hotel-planning-page",
    label: "Hotel planning page",
    description: "Planning page for airport hotels, park-and-fly stays, and overnight airport logistics.",
    pageTypes: ["hotel-cluster"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "hotel area overview",
      "how to choose a stay",
      "airport transfer considerations",
      "parking or shuttle tradeoffs",
      "planning FAQ",
    ],
    checklist: [
      "Compare hotel types or zones",
      "Explain shuttle versus private transfer decisions",
      "Reference park-and-fly options where relevant",
      "Link to hotel transfer and parking guides",
    ],
    writingGuidance:
      "Help travelers choose where to stay and how to connect their stay to the airport with minimal friction.",
  },
  {
    slug: "airline-at-seatac-guide",
    label: "Airline-at-Sea-Tac guide",
    description: "Airline-specific Sea-Tac guide covering terminal context, pickup logic, and planning questions.",
    pageTypes: ["airline-guide"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "terminal and concourse context",
      "check-in or baggage notes",
      "pickup timing guidance",
      "airline-specific FAQ",
      "related airport utility links",
    ],
    checklist: [
      "Confirm terminal/concourse details from official sources",
      "Answer airline-specific pickup and timing questions",
      "Link to arrivals, departures, and airport guide pages",
      "Keep the page clearly useful to the passenger",
    ],
    writingGuidance:
      "Use airline-specific facts and traveler questions. Avoid generic airport copy unless it helps the exact airline user.",
  },
  {
    slug: "parking-guide",
    label: "Parking guide",
    description: "Sea-Tac parking and park-and-fly planning page.",
    pageTypes: ["planning-guide"],
    itemTypes: ["new-page", "support-article"],
    requiredSections: [
      "parking options overview",
      "cost and convenience comparison",
      "ride versus parking tradeoffs",
      "park-and-fly considerations",
      "parking FAQ",
    ],
    checklist: [
      "Compare parking choices and travel scenarios",
      "Explain when parking loses to a prebooked ride",
      "Reference hotel and transfer alternatives",
      "Include a parking decision FAQ",
    ],
    writingGuidance:
      "Make the page useful for a traveler actively comparing parking, hotel, and transfer options before the trip.",
  },
  {
    slug: "comparison-page",
    label: "Comparison page",
    description: "Decision-support page that compares two options, terminals, or transfer scenarios.",
    pageTypes: ["comparison-guide"],
    itemTypes: ["comparison-page"],
    requiredSections: [
      "what is being compared",
      "decision criteria",
      "scenario recommendations",
      "comparison FAQ",
      "links to primary pages",
    ],
    checklist: [
      "State the comparison clearly in title and H1",
      "Use side-by-side decision criteria",
      "Explain which option fits which traveler",
      "Link to both related primary pages",
    ],
    writingGuidance:
      "Help the user decide. The page should reduce uncertainty, not just describe both sides equally.",
  },
  {
    slug: "faq-utility-page",
    label: "FAQ utility page",
    description: "Question-led utility page for arrivals, departures, terminal pickups, and practical airport questions.",
    pageTypes: ["airport-utility"],
    itemTypes: ["faq"],
    requiredSections: [
      "top traveler questions",
      "step-by-step answers",
      "timing and wayfinding notes",
      "related utility links",
    ],
    checklist: [
      "Lead with explicit traveler questions",
      "Keep answers short and concrete",
      "Reference official airport information where relevant",
      "Link to airport guide and transfer pages",
    ],
    writingGuidance:
      "Write for direct retrieval. Answers should be easy for users, agents, and search systems to extract quickly.",
  },
  {
    slug: "blog-post",
    label: "Blog post",
    description: "Evergreen or timely editorial article that supports a cluster or answers a planning question.",
    pageTypes: ["blog-post"],
    itemTypes: ["support-article"],
    requiredSections: [
      "clear thesis",
      "timely or evergreen context",
      "practical examples",
      "links to supporting guides",
    ],
    checklist: [
      "Define the reader and question up front",
      "Keep the article tied to a real planning decision",
      "Link the post into the relevant cluster",
      "Avoid diary-like or reflective product narration",
    ],
    writingGuidance:
      "Write like a useful local guide, not an internal update. The post should answer a traveler question and reinforce a cluster.",
  },
] as const;

export const seoContentBundleSeed = [
  {
    slug: "brand-and-airport-bundle",
    label: "Brand and airport orientation bundle",
    cluster: "brand-and-airport",
    audience: "first-time Sea-Tac travelers",
    intent: "planning",
    description:
      "Homepage and airport-orientation assets that explain how to use Sea-Tac, how to move through the airport, and what planning steps to take next.",
    primaryPageTypes: ["homepage", "planning-guide"],
    requiredAssetTypes: ["primary_page", "airport_guide", "faq_page"],
    futureAdsCandidate: false,
  },
  {
    slug: "airport-routes-bundle",
    label: "Airport transfer routes bundle",
    cluster: "airport-routes",
    audience: "airport travelers booking rides",
    intent: "commercial",
    description:
      "Commercial airport transfer page plus planning and comparison assets that help travelers choose the right pickup strategy.",
    primaryPageTypes: ["route"],
    requiredAssetTypes: ["primary_page", "planning_guide", "comparison_page"],
    futureAdsCandidate: true,
  },
  {
    slug: "eastside-routes-bundle",
    label: "Eastside transfer routes bundle",
    cluster: "eastside-routes",
    audience: "Bellevue and Eastside travelers",
    intent: "planning",
    description:
      "Eastside commercial transfer page with supporting neighborhood and hotel planning assets.",
    primaryPageTypes: ["route"],
    requiredAssetTypes: ["primary_page", "planning_guide", "hotel_transfer_guide"],
    futureAdsCandidate: true,
  },
  {
    slug: "downtown-routes-bundle",
    label: "Downtown Seattle transfer routes bundle",
    cluster: "downtown-routes",
    audience: "downtown Seattle travelers",
    intent: "planning",
    description:
      "Downtown transfer route page with supporting planning and comparison content for Seattle visitors.",
    primaryPageTypes: ["route"],
    requiredAssetTypes: ["primary_page", "planning_guide", "comparison_page"],
    futureAdsCandidate: true,
  },
  {
    slug: "cruise-routes-bundle",
    label: "Cruise transfer bundle",
    cluster: "cruise-routes",
    audience: "cruise travelers",
    intent: "planning",
    description:
      "Cruise-terminal route pages paired with decision-support content for Pier 66 versus Pier 91 and downtown staging.",
    primaryPageTypes: ["route"],
    requiredAssetTypes: ["primary_page", "comparison_page", "planning_guide"],
    futureAdsCandidate: true,
  },
  {
    slug: "airport-hotels-bundle",
    label: "Airport hotel planning bundle",
    cluster: "airport-hotels",
    audience: "airport hotel planners",
    intent: "planning",
    description:
      "Airport hotel pages, park-and-fly planning, and supporting editorial content around overnight Sea-Tac stays.",
    primaryPageTypes: ["hotel-cluster"],
    requiredAssetTypes: ["primary_page", "hotel_planning_page", "blog_post"],
    futureAdsCandidate: true,
  },
  {
    slug: "hotel-transfers-bundle",
    label: "Hotel transfer bundle",
    cluster: "hotel-transfers",
    audience: "hotel guests booking airport transportation",
    intent: "commercial",
    description:
      "Hotel-specific transfer pages supported by broader transfer guidance for airport hotel pickups and lobby coordination.",
    primaryPageTypes: ["hotel-transfer"],
    requiredAssetTypes: ["primary_page", "hotel_transfer_guide", "planning_guide"],
    futureAdsCandidate: true,
  },
  {
    slug: "airline-guides-bundle",
    label: "Airline guide bundle",
    cluster: "airline-guides",
    audience: "airline-specific airport planners",
    intent: "planning",
    description:
      "Airline-at-Sea-Tac pages supported by utility and planning guidance for terminal, baggage, and pickup decisions.",
    primaryPageTypes: ["airline-guide"],
    requiredAssetTypes: ["primary_page", "planning_guide", "faq_page"],
    futureAdsCandidate: false,
  },
  {
    slug: "airport-utilities-bundle",
    label: "Airport utilities bundle",
    cluster: "airport-utilities",
    audience: "travelers checking arrivals and departures",
    intent: "planning",
    description:
      "Utility pages for arrivals and departures paired with question-led support content and airport orientation.",
    primaryPageTypes: ["airport-utility"],
    requiredAssetTypes: ["primary_page", "faq_page", "planning_guide"],
    futureAdsCandidate: false,
  },
  {
    slug: "airport-planning-bundle",
    label: "Airport planning bundle",
    cluster: "airport-planning",
    audience: "travelers planning parking and airport logistics",
    intent: "planning",
    description:
      "Parking, park-and-fly, and airport-comparison pages that help travelers choose between driving, hotels, and transfers.",
    primaryPageTypes: ["planning-guide"],
    requiredAssetTypes: ["primary_page", "comparison_page", "blog_post"],
    futureAdsCandidate: true,
  },
] as const;

export function inferSeoBundleAssetType(input: {
  templateFamilySlug?: string | null;
  pageType?: string | null;
  keywordCluster?: string | null;
  itemType?: string | null;
  publishTarget?: string | null;
}) {
  const templateFamilySlug = input.templateFamilySlug ?? null;
  const pageType = input.pageType ?? null;
  const cluster = input.keywordCluster ?? null;
  const itemType = input.itemType ?? null;
  const publishTarget = input.publishTarget ?? null;

  if (templateFamilySlug === "airport-guide") return "airport_guide";
  if (templateFamilySlug === "hotel-transfer-guide" || pageType === "hotel-transfer") {
    return "hotel_transfer_guide";
  }
  if (templateFamilySlug === "hotel-planning-page" || pageType === "hotel-cluster") {
    return "hotel_planning_page";
  }
  if (
    templateFamilySlug === "airport-transfer-guide" ||
    templateFamilySlug === "neighborhood-transfer-guide" ||
    templateFamilySlug === "parking-guide" ||
    (pageType === "planning-guide" && cluster !== "brand-and-airport")
  ) {
    return "planning_guide";
  }
  if (pageType === "planning-guide" && cluster === "brand-and-airport") {
    return "airport_guide";
  }
  if (templateFamilySlug === "comparison-page" || pageType === "comparison-guide" || itemType === "comparison-page") {
    return "comparison_page";
  }
  if (templateFamilySlug === "faq-utility-page" || pageType === "airport-utility" || itemType === "faq") {
    return "faq_page";
  }
  if (templateFamilySlug === "blog-post" || pageType === "blog-post" || publishTarget === "blog" || itemType === "support-article") {
    return "blog_post";
  }
  if (
    templateFamilySlug === "route-page" ||
    pageType === "route" ||
    pageType === "airline-guide" ||
    pageType === "airport-utility" ||
    pageType === "homepage"
  ) {
    return "primary_page";
  }

  return null;
}

export function inferSeoTemplateFamilySlug(input: {
  pageType?: string | null;
  keywordCluster?: string | null;
  itemType?: string | null;
  title?: string | null;
  targetKeyword?: string | null;
  url?: string | null;
  publishTarget?: string | null;
}) {
  const haystack = `${input.title ?? ""} ${input.targetKeyword ?? ""} ${input.url ?? ""} ${input.publishTarget ?? ""}`.toLowerCase();
  const pageType = input.pageType ?? null;
  const cluster = input.keywordCluster ?? null;
  const itemType = input.itemType ?? null;

  if (pageType === "route") return "route-page";
  if (pageType === "comparison-guide" || itemType === "comparison-page") return "comparison-page";
  if (pageType === "airport-utility" || itemType === "faq") return "faq-utility-page";
  if (pageType === "airline-guide") return "airline-at-seatac-guide";
  if (pageType === "hotel-transfer") return "hotel-transfer-guide";
  if (pageType === "hotel-cluster") return "hotel-planning-page";
  if (pageType === "homepage") return "airport-guide";
  if (pageType === "blog-post" || itemType === "support-article" || input.publishTarget === "blog") return "blog-post";

  if (pageType === "planning-guide" || itemType === "new-page") {
    if (cluster === "airport-planning" || haystack.includes("parking") || haystack.includes("park-and-fly")) {
      return "parking-guide";
    }
    if (cluster === "brand-and-airport" || haystack.includes("airport guide")) {
      return "airport-guide";
    }
    if (cluster === "eastside-routes" || cluster === "downtown-routes" || haystack.includes("eastside") || haystack.includes("downtown") || haystack.includes("bellevue") || haystack.includes("kirkland")) {
      return "neighborhood-transfer-guide";
    }
    if (cluster === "airport-routes" || haystack.includes("airport transfer")) {
      return "airport-transfer-guide";
    }
    if (cluster === "airport-hotels") {
      return "hotel-planning-page";
    }
    if (cluster === "hotel-transfers" || haystack.includes("hotel transfer")) {
      return "hotel-transfer-guide";
    }
  }

  if (cluster === "airport-planning") return "parking-guide";
  if (cluster === "brand-and-airport") return "airport-guide";
  if (cluster === "airport-hotels") return "hotel-planning-page";
  if (cluster === "hotel-transfers") return "hotel-transfer-guide";
  if (cluster === "airline-guides") return "airline-at-seatac-guide";
  if (cluster === "airport-utilities") return "faq-utility-page";
  if (cluster === "airport-routes") return "airport-transfer-guide";
  if (cluster === "eastside-routes" || cluster === "downtown-routes") return "neighborhood-transfer-guide";
  if (cluster === "cruise-routes") return "comparison-page";

  return null;
}

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
