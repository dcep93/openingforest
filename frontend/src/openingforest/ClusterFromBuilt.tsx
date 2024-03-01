import { Opening } from "./BuildFromCsv";

import { kmeans } from "ml-kmeans";

export type ClusterType = {
  size: number;
  openings: string[];
  centroid: { [c: string]: number };
};

export default function buildClusters(
  openings: Opening[],
  options: {
    numClusters: number;
    numCategories: number;
    minClusterRatio: number;
  }
) {
  const allOpening = openings.find((obj) => obj.name === "<all>")!;
  const ratios = Object.fromEntries(
    Object.entries(allOpening.categories)
      .map(([k, v]) => [k, v / allOpening.total])
      .slice(0, options.numCategories)
  );
  const allCategories = Object.keys(ratios);
  const taggedData = openings
    .filter((obj) => !obj.name.includes("<"))
    .map(({ name, total, categories }) => ({
      name,
      data: allCategories.map((c) => (categories[c] / total || 0) - ratios[c]),
    }));
  const data = taggedData.map(({ data }) => data);
  const clusters = kmeans(data, options.numClusters, { seed: 0 });
  const info = clusters.computeInformation(data);
  return Object.entries(
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
    .filter(({ size }) => size >= data.length * options.minClusterRatio)
    .concat({ size: Infinity, openings: [], centroid: ratios })
    .sort((a, b) => b.size - a.size);
}

export function group<T>(arr: T[], f: (t: T) => string): { [k: string]: T[] } {
  return arr.reduce((prev, curr) => {
    const k = f(curr);
    prev[k] = (prev[k] || []).concat(curr);
    return prev;
  }, {} as { [name: string]: T[] });
}
