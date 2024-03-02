import { useEffect, useState } from "react";
import build from "./BuildFromCsv";
import Clusters from "./Clusters";
import {
  OpeningMovesType,
  loadOpeningMoves,
  openingGroups,
} from "./OpeningGroups";
import Openings from "./Openings";

var initialized = false;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    false && build();
  }, []);

  const [openingMoves, updateOpeningMoves] = useState<OpeningMovesType | null>(
    null
  );
  useEffect(() => {
    if (openingMoves !== null) return;
    loadOpeningMoves().then(
      (_openingMoves) =>
        _openingMoves !== null && updateOpeningMoves(_openingMoves)
    );
  }, [openingMoves]);

  const [numOpenings, updateNumOpenings] = useState(100);
  const [openingDepth, updateOpeningDepth] = useState(4);

  const [group, updateGroup] = useState(Object.keys(openingGroups)[0]);
  const openings = openingGroups[group].slice(0, numOpenings);

  if (openingMoves === null) return null;

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
        <div>
          openingDepth:{" "}
          <input
            type="number"
            style={{ width: "4em" }}
            value={openingDepth}
            onChange={(e) => updateOpeningDepth(parseInt(e.target.value))}
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
