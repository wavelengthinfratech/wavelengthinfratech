const logos = [
  "L&T Sub-contractors", "Shapoorji Vendors", "Tata Projects MEP", "DLF Site Teams",
  "Godrej Properties", "Sobha Civil", "Prestige Group", "Brigade Builders",
];

export const TrustBar = () => {
  return (
    <section className="py-12 border-y border-border/50 bg-card/30">
      <div className="container">
        <p className="text-center text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Trusted by site teams working with
        </p>
        <div className="relative overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...logos, ...logos].map((l, i) => (
              <span key={i} className="text-lg font-semibold text-muted-foreground/70 tracking-tight">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
