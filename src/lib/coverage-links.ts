export type CoverageLink = {
  label: string;
  href: string;
};

export function getCoverageLinks(areas: readonly string[]): CoverageLink[] {
  return areas.map((area) => {
    switch (area) {
      case "Sea-Tac Airport":
        return { label: area, href: "/seatac-airport-car-service" };
      case "Sea-Tac hotels":
        return { label: area, href: "/seatac-airport-hotels" };
      case "Downtown Seattle":
        return { label: area, href: "/seatac-to-downtown-seattle" };
      case "Bellevue":
        return { label: area, href: "/seatac-to-bellevue" };
      case "Kirkland":
        return { label: area, href: "/seatac-to-kirkland" };
      case "Mercer Island":
        return { label: area, href: "/seatac-airport-car-service" };
      case "South Lake Union":
        return { label: area, href: "/seatac-to-downtown-seattle" };
      default:
        return { label: area, href: "/seatac-airport-car-service" };
    }
  });
}
