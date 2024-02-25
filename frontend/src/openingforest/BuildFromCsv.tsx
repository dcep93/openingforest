import Papa from "papaparse";

export type Categories = { [c: string]: number };
export type Opening = {
  name: string;
  categories: Categories;
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
                  .then(() => ({} as { [n: string]: Categories }))
                  .then((openingCategories) =>
                    Promise.resolve()
                      .then(() =>
                        results.data.map((r) =>
                          r.OpeningTags.split(" ")
                            .concat("<all>")
                            .forEach((name) => {
                              if (!openingCategories[name])
                                openingCategories[name] = {};
                              r.Themes.split(" ").forEach((c) => {
                                openingCategories[name][c] =
                                  (openingCategories[name][c] || 0) + 1;
                              });
                            })
                        )
                      )
                      .then(() => openingCategories)
                  )
                  .then((openingCategories) =>
                    Object.entries(openingCategories).map(
                      ([name, categories]) => ({
                        name,
                        categories,
                        total: Object.values(categories).reduce(
                          (a, b) => a + b,
                          0
                        ),
                      })
                    )
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
  let i = 0;
  return arr.reduce((prev, curr) => {
    if (++i % 10000 === 0) {
      console.log(i, arr.length);
    }
    const k = f(curr);
    prev[k] = (prev[k] || []).concat(curr);
    return prev;
  }, {} as { [name: string]: T[] });
}
