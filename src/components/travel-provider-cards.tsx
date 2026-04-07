import type { ProviderStatus } from "@/lib/travel/types";

type TravelProviderCardsProps = {
  providers: ProviderStatus[];
};

export function TravelProviderCards({ providers }: TravelProviderCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {providers.map((provider) => (
        <article
          key={provider.key}
          className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-white p-5 shadow-[0_4px_20px_rgba(45,106,79,0.05)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">
                {provider.verticals.join(" / ")}
              </p>
              <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                {provider.name}
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] ${
                provider.enabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {provider.enabled ? "Ready" : "Setup needed"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">{provider.notes}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#7d9388]">
            {provider.checkoutMode.replaceAll("_", " ")}
          </p>
        </article>
      ))}
    </div>
  );
}
