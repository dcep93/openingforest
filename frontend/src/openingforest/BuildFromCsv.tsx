import Papa from "papaparse";

export type Opening = {
  name: string;
  categories: { [c: string]: number };
  total: number;
};

export function build(): Promise<Opening[]> {
  return (
    fetch("./lichess_db_puzzle.csv") // lichess_db_puzzle
      // PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
      .then((resp) =>
        resp.arrayBuffer().then((arrayBuffer) => {
          const uint8Array = new Uint8Array(arrayBuffer);
          let line = "";
          const arr = [];
          for (let i = 0; i < uint8Array.length; i++) {
            const char = String.fromCharCode(uint8Array[i]);
            if (char === "\n") {
              arr.push(line.split(",").slice(7).join(","));
              line = "";
            } else {
              line += char;
            }
          }
          return arr.join("\n");
        })
      )
      .then(
        (text) =>
          new Promise((resolve) =>
            Papa.parse<{ OpeningTags: string; Themes: string }>(text, {
              header: true,
              complete: (results) =>
                Promise.resolve()
                  .then(() => console.log(results))
                  .then(() =>
                    results.data.flatMap((r) =>
                      r.OpeningTags.split(" ").map((name) => ({
                        name,
                        themes: r.Themes.split(" "),
                      }))
                    )
                  )
                  .then((arr) => group(arr, (t) => t.name))
                  .then((obj) =>
                    Object.entries(obj)
                      .map(([name, arr]) => ({
                        name,
                        themes: arr.flatMap((a) => a.themes),
                      }))
                      .map(({ name, themes }) => ({
                        name,
                        total: themes.length,
                        g: group(themes, (t) => t),
                      }))
                      .map(({ g, ...obj }) => ({
                        categories: Object.fromEntries(
                          Object.entries(g).map(([k, v]) => [k, v.length])
                        ),
                        ...obj,
                      }))
                  )
                  .then((arr) => arr.sort((a, b) => b.total - a.total))
                  .then((openings) => {
                    console.log(openings);
                    return openings;
                  })
                  .then((openings) => resolve(openings)),
            })
          )
      )
  );
}

export function group<T>(arr: T[], f: (t: T) => string): { [k: string]: T[] } {
  return arr.reduce((prev, curr) => {
    const k = f(curr);
    prev[k] = (prev[k] || []).concat(curr);
    return prev;
  }, {} as { [name: string]: T[] });
}
