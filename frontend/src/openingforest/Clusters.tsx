import { useState } from "react";

import { Opening } from "./BuildFromCsv";
import buildClusters, { ClusterType } from "./ClusterFromBuilt";
import Hideable from "./Hideable";

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
            <Hideable
              parent={
                <div>
                  <div>index: {i}</div>
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
  );
}
