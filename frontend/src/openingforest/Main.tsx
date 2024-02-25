import { useEffect, useState } from "react";
import build, { Opening } from "./BuildFromCsv";
import cluster, { Cluster } from "./ClusterFromBuilt";
import Hideable from "./Hideable";

import by_move from "./by_move.json";
import by_theme from "./by_theme.json";

var initialized = true;

const opening_groups: { [k: string]: Opening[] } = {
  by_theme,
  by_move,
};

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build();
  }, []);
  const [group, updateGroup] = useState(Object.keys(opening_groups)[0]);
  const openings = opening_groups[group];
  const clusters: Cluster[] = cluster(openings);
  return (
    <div>
      <div>openingforest</div>
      <div>
        <select value={group} onChange={(e) => updateGroup(e.target.value)}>
          {Object.keys(opening_groups).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
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
