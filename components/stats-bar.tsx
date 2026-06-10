const stats = [
  { value: "60 MIN", label: "Avg. Arrival" },
  { value: "2,400+", label: "Jobs Hauled" },
  { value: "$0", label: "Hidden Fees" },
  { value: "100%", label: "Vetted Crew" },
]

export function StatsBar() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center gap-1 px-6 py-10 text-center ${
              i !== 0 ? "lg:border-l lg:border-border" : ""
            } ${i % 2 !== 0 ? "border-l border-border lg:border-l" : ""} ${
              i >= 2 ? "border-t border-border lg:border-t-0" : ""
            }`}
          >
            <span className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground">
              {stat.value}
            </span>
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
