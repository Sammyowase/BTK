type StatCardProps = {
  detail: string
  label: string
  value: string
}

export function StatCard({ detail, label, value }: StatCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-brand/10 bg-white/90 p-5 shadow-[0_18px_55px_rgba(13,54,77,0.07)] backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-3 font-heading text-2xl font-bold tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </article>
  )
}
