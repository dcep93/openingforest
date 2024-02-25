import Papa from "papaparse";

export type Categories = { [c: string]: number };
export type Opening = {
  name: string;
  categories: Categories;
  total: number;
};

export type Row = {
  OpeningTags: string;
  Themes: string;
  FEN: string;
  Moves: string;
};

var numRows = -1;
var rowsSeen = 0;

function getCategories(r: Row): string[] {
  if (++rowsSeen % 10000 === 0) console.log(rowsSeen, numRows);
  // return r.Themes.split(" ");
  const move = r.Moves.split(" ")[0];
  var column = move.charCodeAt(0) - 97;
  const char = r.FEN.split("/")
    [8 - parseInt(move[1])].split("")
    .find((char) => {
      if (column === 0) {
        return true;
      }
      const p = parseInt(char);
      if (isNaN(p)) {
        column -= 1;
      } else {
        column -= p;
      }
      return false;
    });
  return [`${char}->${move.slice(2)}`];
}

export default function build(): Promise<Opening[]> {
  return (
    fetch("./lichess_db_puzzle.csv") // lichess_db_puzzle
      // 3709216 - PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
      .then((resp) =>
        resp.arrayBuffer().then((arrayBuffer) => {
          const uint8Array = new Uint8Array(arrayBuffer);
          let line = "";
          const arr = [];
          for (let i = 0; i < uint8Array.length; i++) {
            const char = String.fromCharCode(uint8Array[i]);
            if (char === "\n") {
              arr.push(line);
              line = "";
            } else {
              line += char;
            }
          }
          numRows = arr.length;
          return arr.join("\n");
        })
      )
      .then(
        (text) =>
          new Promise((resolve) =>
            Papa.parse<Row>(text, {
              header: true,
              complete: (results) =>
                Promise.resolve()
                  .then(() => console.log(results))
                  .then(() => ({} as { [n: string]: Categories }))
                  .then((openingCategories) =>
                    Promise.resolve()
                      .then(() =>
                        results.data.map((r) =>
                          (r.OpeningTags || "<none>")
                            .split(" ")
                            .concat("<all>")
                            .forEach((name) => {
                              if (!openingCategories[name])
                                openingCategories[name] = {};
                              getCategories(r).forEach((c) => {
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
                        total: Object.values(categories).reduce(
                          (a, b) => a + b,
                          0
                        ),
                        categories: Object.fromEntries(
                          Object.entries(categories)
                            .map(([k, v]) => ({ k, v }))
                            .sort((a, b) => b.v - a.v)
                            .map(({ k, v }) => [k, v])
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
