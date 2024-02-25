import { Opening } from "./BuildFromCsv";

import { kmeans } from "ml-kmeans";

const NUM_CLUSTERS = 50;

const MIN_RATIO = 0.01;

export type Cluster = {
  size: number;
  openings: string[];
  centroid: { [c: string]: number };
};

export default function cluster(openings: Opening[]) {
  const allCategories = Object.keys(
    openings.find((obj) => obj.name === "<all>")!.categories
  );
  const taggedData = openings
    .filter((obj) => !obj.name.includes("<"))
    .map(({ name, total, categories }) => ({
      name,
      data: allCategories.map((c) => categories[c] / total || 0),
    }));
  const data = taggedData.map(({ data }) => data);
  const clusters = kmeans(data, NUM_CLUSTERS, { seed: 0 });
  const info = clusters.computeInformation(data);
  const rval = Object.entries(
    group(
      clusters.clusters.map((c, i) => ({ c, i })),
      (t) => t.c.toString()
    )
  )
    .map(([clusterIndex, arr]) => ({
      size: arr.length,
      openings: arr.map(({ i }) => taggedData[i].name),
      centroid: Object.fromEntries(
        info[parseInt(clusterIndex)].centroid
          .map((v, i) => ({ v, i }))
          .sort((a, b) => b.v - a.v)
          .map(({ v, i }) => [allCategories[i], v])
      ),
    }))
    .filter(({ size }) => size >= data.length * MIN_RATIO)
    .sort((a, b) => b.size - a.size);
  console.log(rval);
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
