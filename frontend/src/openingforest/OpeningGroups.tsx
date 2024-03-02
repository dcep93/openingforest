import { Opening } from "./BuildFromCsv";
import by_move from "./by_move.json";
import by_theme from "./by_theme.json";

export const openingGroups: { [k: string]: Opening[] } = {
  by_theme,
  by_move,
};

export function loadOpeningMoves(): Promise<{ [k: string]: string[] }> {
  return Promise.all(
    ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"].map((f) =>
      fetch(`${process.env.PUBLIC_URL}/eco/dist/${f}`)
        .then((response) => response.text())
        .then((text) =>
          text
            .split("\n")
            .slice(1)
            .filter((l) => l)
            .map((l) => l.split("\t"))
            .map(([eco, name, pgn, uci, epd]) => [name, pgn])
        )
    )
  )
    .then((arr) => arr.flatMap((a) => a))
    .then(Object.fromEntries);
}
