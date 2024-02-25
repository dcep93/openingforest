import { useEffect, useState } from "react";
import { Opening, build } from "./BuildFromCsv";
import raw_openings from "./data.json";

var initialized = true;

const openings: Opening[] = raw_openings;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build();
  }, []);
  const [hiddens, updateHiddens] = useState<{ [name: string]: boolean }>({});
  return (
    <div>
      <div>openingforest</div>
      {openings.map((obj) => (
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
