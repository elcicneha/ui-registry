export type PropRow = {
  name: string
  type: string
  default?: string
  description: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm [&_td]:px-4 [&_td]:py-2 [&_th]:px-4 [&_th]:py-2 [&_th]:font-medium">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.name}
              className={i === rows.length - 1 ? "" : "border-b"}
            >
              <td className="font-mono text-sm">{row.name}</td>
              <td className="font-mono text-sm text-muted-foreground">
                {row.type}
              </td>
              <td className="font-mono text-sm text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
