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

function getCategories(r: Row): string[] {
  // return r.Themes.split(" ");
  const move = r.Moves.split(" ")[1];
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

export default function build() {
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
              line = line
                .split(",")
                .filter((_, i) => [1, 2, 7, 9].includes(i))
                .join(",");
              arr.push(line);
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
          new Promise<Papa.ParseResult<Row>>((resolve) =>
            Papa.parse<Row>(text, {
              header: true,
              complete: (results) => resolve(results),
            })
          )
      )
      .then((results) =>
        Promise.resolve(results)
          .then(() => console.log(results))
          .then(() => ({} as { [n: string]: Categories }))
          .then((openingCategories) =>
            Promise.resolve()
              .then(() =>
                results.data.map((r, i) =>
                  (r.OpeningTags || "<none>")
                    .split(" ")
                    .concat("<all>")
                    .forEach((name) => {
                      if (!openingCategories[name])
                        openingCategories[name] = {};
                      getCategories(r)
                        .concat("<all>")
                        .forEach((c) => {
                          openingCategories[name][c] =
                            (openingCategories[name][c] || 0) + 1;
                        });
                    })
                )
              )
              .then(() => openingCategories)
          )
      )
      .then((openingCategories) =>
        Object.entries(openingCategories).map(([name, categories]) => ({
          name,
          total: categories["<all>"],
          categories: Object.fromEntries(
            Object.entries(categories)
              .map(([k, v]) => ({ k, v }))
              .filter(({ k }) => k !== "<all>")
              .sort((a, b) => b.v - a.v)
              .map(({ k, v }) => [k, v])
          ),
        }))
      )
      .then((arr) => arr.sort((a, b) => b.total - a.total))
      .then((openings) => {
        console.log(openings);
        return openings;
      })
  );
}
