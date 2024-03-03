import { useState } from "react";

import { kmeans } from "ml-kmeans";

import Bubble from "./Bubble";
import { Opening } from "./BuildFromCsv";

export type ClusterType = {
  size: number;
  openings: string[];
  centroid: { [c: string]: number };
};

export default function Clusters(props: { openings: Opening[] }) {
  const [numClusters, updateNumClusters] = useState(25);
  const [numCategories, updateNumCategories] = useState(25);
  const [minClusterRatio, updateMinClusterRatio] = useState(0.01);

  const clusters: ClusterType[] = buildClusters(props.openings, {
    numClusters,
    numCategories,
    minClusterRatio,
  });

  return (
    <div>
      <div>
        <div>
          numClusters:{" "}
          <input
            type="number"
            style={{ width: "4em" }}
            value={numClusters}
            onChange={(e) => updateNumClusters(parseInt(e.target.value))}
          />
        </div>
        <div>
          numCategories:{" "}
          <input
            type="number"
            style={{ width: "4em" }}
            value={numCategories}
            onChange={(e) => updateNumCategories(parseInt(e.target.value))}
          />
        </div>
        <div>
          minClusterRatio:{" "}
          <input
            type="number"
            style={{ width: "4em" }}
            step={0.01}
            value={minClusterRatio}
            onChange={(e) => updateMinClusterRatio(parseFloat(e.target.value))}
          />
        </div>
        <div>cluster sizes: {clusters.map((c) => c.size).join(",")}</div>
      </div>
      <div>
        {clusters.map((obj, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
            <Bubble
              parent={
                <div>
                  <div>index: {i}</div>
                </div>
              }
            >
              <div>{JSON.stringify(obj.centroid, null, 2)}</div>
            </Bubble>
            <Bubble
              parent={
                <div>
                  <div>size: {obj.size}</div>
                </div>
              }
            >
              <div>
                {obj.openings.map((o) => (
                  <div key={o}>
                    <a href={`#${o}`}>{o}</a>
                  </div>
                ))}
              </div>
            </Bubble>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildClusters(
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
