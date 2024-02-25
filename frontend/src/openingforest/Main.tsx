import { useEffect, useState } from "react";
import { Opening } from "./BuildFromCsv";
import cluster from "./ClusterFromBuilt";
import raw_openings from "./data.json";

var initialized = false;

const openings: Opening[] = raw_openings;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    // build();
    cluster(openings);
  }, []);
  const [hiddens, updateHiddens] = useState<{ [name: string]: boolean }>({});
  return (
    <div>
      <div>openingforest</div>
      {openings
        .map(({ categories, ...obj }) => ({
          categories: Object.fromEntries(
            Object.entries(categories).map(([k, v]) => [
              k,
              (v / obj.total).toFixed(6),
            ])
          ),
          ...obj,
        }))
        .map((obj) => (
          <div
            key={obj.name}
            style={{
              cursor: "pointer",
              border: "2px solid black",
              padding: "2em",
              margin: "2em",
            }}
            onClick={() =>
              updateHiddens(
                Object.assign({}, hiddens, { [obj.name]: !hiddens[obj.name] })
              )
            }
          >
            <div>{obj.name}</div>
            <div>total: {obj.total}</div>
            <pre hidden={hiddens[obj.name]}>
              {JSON.stringify(obj.categories, null, 2)}
            </pre>
          </div>
        ))}
    </div>
  );
}
