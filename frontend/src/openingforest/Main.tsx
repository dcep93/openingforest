import { useEffect, useState } from "react";
import build from "./BuildFromCsv";
import cluster, { Cluster } from "./ClusterFromBuilt";
import Hideable from "./Hideable";
import { openingGroups } from "./OpeningGroups";

var initialized = true;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build();
  }, []);

  const [numClusters, updateNumClusters] = useState(25);
  const [numCategories, updateNumCategories] = useState(25);
  const [minClusterRatio, updateMinClusterRatio] = useState(0.01);
  const [group, updateGroup] = useState(Object.keys(openingGroups)[0]);

  const openings = openingGroups[group];
  const clusters: Cluster[] = cluster(openings, {
    numClusters,
    numCategories,
    minClusterRatio,
  });
  return (
    <div>
      <div>openingforest</div>
      <div>
        <div>
          <select value={group} onChange={(e) => updateGroup(e.target.value)}>
            {Object.keys(openingGroups).map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
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
      </div>
      <div>cluster sizes: {clusters.map((c) => c.size).join(",")}</div>
      <div style={{ display: "flex" }}>
        <div>
          {openings.map((obj, i) => (
            <div key={i}>
              <Hideable
                parent={
                  <div>
                    <div>{obj.name}</div>
                    <div>total: {obj.total}</div>
                  </div>
                }
              >
                {JSON.stringify(obj.categories, null, 2)}
              </Hideable>
            </div>
          ))}
        </div>
        <div>
          {clusters.map((obj, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
              <Hideable
                parent={
                  <div>
                    <div>index: {i + 1}</div>
                  </div>
                }
              >
                <div>{JSON.stringify(obj.centroid, null, 2)}</div>
              </Hideable>
              <Hideable
                parent={
                  <div>
                    <div>size: {obj.size}</div>
                  </div>
                }
              >
                <div>{JSON.stringify(obj.openings, null, 2)}</div>
              </Hideable>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
