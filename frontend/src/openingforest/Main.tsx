import { useEffect, useState } from "react";
import build from "./BuildFromCsv";
import Clusters from "./Clusters";
import { openingGroups } from "./OpeningGroups";
import Openings from "./Openings";

var initialized = true;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build();
  }, []);

  const [numOpenings, updateNumOpenings] = useState(500);

  const [group, updateGroup] = useState(Object.keys(openingGroups)[0]);
  const openings = openingGroups[group].slice(0, numOpenings);

  return (
    <div>
      <div>openingforest</div>
      <div>
        <select value={group} onChange={(e) => updateGroup(e.target.value)}>
          {Object.keys(openingGroups).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <div>
          numOpenings:{" "}
          <input
            type="number"
            style={{ width: "4em" }}
            value={numOpenings}
            onChange={(e) => updateNumOpenings(parseInt(e.target.value))}
          />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <Openings openings={openings} />
        <Clusters openings={openings} />
      </div>
    </div>
  );
}
