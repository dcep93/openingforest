import Papa from "papaparse";

export type Opening = {
  name: string;
  categories: { [c: string]: number };
  total: number;
};

export function build(): Promise<Opening[]> {
  return fetch("./sample.csv")
    .then((resp) => resp.text())
    .then(
      (text) =>
        new Promise((resolve) =>
          Papa.parse<{ OpeningTags: string; Themes: string }>(text, {
            header: true,
            complete: (results) =>
              Promise.resolve()
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
                .then((openings) => resolve(openings)),
          })
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
