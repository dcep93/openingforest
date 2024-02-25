import { useEffect, useState } from "react";
import build, { Opening } from "./BuildFromCsv";
import cluster, { Cluster } from "./ClusterFromBuilt";
import Hideable from "./Hideable";
import raw_openings from "./data.json";

var initialized = true;

const openings: Opening[] = raw_openings as unknown as Opening[];
const clusters: Cluster[] = cluster(openings);

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build();
  }, []);
  const [hiddens, updateHiddens] = useState<{ [key: string]: boolean }>({});
  return (
    <div>
      <div>openingforest</div>
      <div>cluster sizes: {clusters.map((c) => c.size).join(",")}</div>
      <div style={{ display: "flex" }}>
        <div>
          {openings.map((obj, i) => (
            <div key={i}>
              <div
                style={{
                  display: "inline-block",
                  cursor: "pointer",
                  border: "2px solid black",
                  padding: "2em",
                  margin: "2em",
                }}
                onClick={() =>
                  updateHiddens(
                    Object.assign({}, hiddens, {
                      [obj.name]: !hiddens[obj.name],
                    })
                  )
                }
              >
                <div>{obj.name}</div>
                <div>total: {obj.total}</div>
                <pre hidden={hiddens[obj.name]}>
                  {JSON.stringify(obj.categories, null, 2)}
                </pre>
              </div>
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
