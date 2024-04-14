import { Opening } from "./BuildFromCsv";
import by_move from "./by_move.json";
import by_theme from "./by_theme.json";

export const openingGroups: { [k: string]: Opening[] } = {
  by_theme: by_theme as Opening[],
  by_move: by_move as Opening[],
};

export type OpeningMovesType = {
  byEpd: { [k: string]: string };
  byName: { [k: string]: string[] };
  byMoves: { [k: string]: string };
};

var loaded = false;
export function loadOpeningMoves(): Promise<OpeningMovesType | null> {
  if (loaded) return Promise.resolve(null);
  loaded = true;
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
            .map(([eco, name, pgn, uci, epd]) => ({ eco, name, pgn, uci, epd }))
        )
    )
  )
    .then((arr) => arr.flatMap((a) => a))
    .then((arr) =>
      arr.map(({ name, pgn, epd }) => ({
        name: name
          .replaceAll("ü", "u")
          .replaceAll("ö", "o")
          .replaceAll("ć", "c")
          .replaceAll("é", "e")
          .replaceAll("ó", "o")
          .replaceAll("ä", "a")
          .replaceAll("á", "a")
          .replaceAll(/[ ]/g, "_")
          .replaceAll(/[':.]/g, ""),
        pgn: pgn.replaceAll(/\d+\. /g, ""),
        epd,
      }))
    )
    .then((arr) => arr.sort((a, b) => a.pgn.length - b.pgn.length))
    .then((arr) => ({
      byEpd: Object.fromEntries(arr.map(({ name, epd }) => [epd, name])),
      byName: Object.fromEntries(
        arr.map(({ name, pgn }) => [name, pgn.split(" ")])
      ),
      byMoves: Object.fromEntries(arr.map(({ name, pgn }) => [pgn, name])),
    }));
}
