import { eligibility } from '../data/event'

/** Who can enter — chips plus any officially confirmed requirements. */
export function Eligibility() {
  return (
    <div>
      <p className="eyebrow text-ink/55">Open to</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {eligibility.audiences.map((a) => (
          <li key={a} className="rounded-full border border-ink/20 px-3 py-1 text-xs font-medium">
            {a}
          </li>
        ))}
      </ul>
      {eligibility.requirements.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-ink/75 marker:text-accent">
          {eligibility.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-ink/60">{eligibility.note}</p>
      )}
    </div>
  )
}
