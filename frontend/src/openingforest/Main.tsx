import { useEffect, useState } from "react";
import { Tactic, getTactics } from "./Lichess";

export default function Main() {
  const [openings, updateOpenings] = useState<
    | {
        name: string;
        tactics: Tactic[];
      }[]
    | null
  >(null);
  useEffect(() => {
    if (openings !== null) return;
    getTactics()
      .then((tactics) => group(tactics, (t) => t.opening))
      .then((g) =>
        Object.entries(g)
          .map(([name, tactics]) => ({ name, tactics }))
          .sort((a, b) => b.tactics.length - a.tactics.length)
      )
      .then(updateOpenings);
  }, [openings]);
  return (
    <div>
      <div>openingforest</div>
      <pre>{JSON.stringify(openings, null, 2)}</pre>
    </div>
  );
}

function group<T>(arr: T[], f: (t: T) => string): { [k: string]: T[] } {
  return arr.reduce((prev, curr) => {
    const k = f(curr);
    prev[k] = (prev[k] || []).concat(curr);
    return prev;
  }, {} as { [name: string]: T[] });
}
