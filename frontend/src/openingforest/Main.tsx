import { useEffect, useState } from "react";
import build, { Categories } from "./BuildFromCsv";
import Clusters, { group } from "./Clusters";
import {
  OpeningMovesType,
  loadOpeningMoves,
  openingGroups,
} from "./OpeningGroups";
import Openings from "./Openings";

var initialized = false;

enum Filter {
  allowAll,
  onlyUnnamed,
  onlyUnknown,
  skipUnknown,
  skipShallow,
}

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
  const [toFilter, updateToFilter] = useState(Filter.allowAll);

  const [groupX, updateGroup] = useState(Object.keys(openingGroups)[0]);

  if (openingMoves === null) return null;

  const openings = Object.entries(
    group(openingGroups[groupX], (opening) => {
      if (opening.name.includes("<")) return opening.name;
      const movesArr = openingMoves.byName[opening.name]?.slice(
        0,
        openingDepth
      );
      if (movesArr === undefined) {
        if (
          toFilter === Filter.skipShallow ||
          toFilter === Filter.skipUnknown ||
          toFilter === Filter.onlyUnnamed
        )
          return "<skip>";
        return opening.name;
      }
      if (toFilter === Filter.onlyUnknown) return "<skip>";
      if (toFilter === Filter.skipShallow && movesArr.length < openingDepth)
        return "<skip>";
      const moves = movesArr.join(" ");
      const core = openingMoves.byMoves[moves];
      if (core === undefined) return `(<unnamed>) ${moves}`;
      if (toFilter === Filter.onlyUnnamed) return "<skip>";
      return `${core} (${moves})`;
    })
  )
    .map(([name, grouped]) => ({
      name: name.replace(
        "<unnamed>",
        grouped.sort((a, b) => b.total - a.total)[0].name
      ),
      categories: grouped.reduce((prev, curr) => {
        Object.entries(curr.categories).forEach(
          ([k, v]) => (prev[k] = (prev[k] || 0) + v)
        );
        return prev;
      }, {} as Categories),
    }))
    .map((o) => ({
      ...o,
      total: Object.values(o.categories).reduce((a, b) => a + b, 0),
    }))
    .slice(0, numOpenings);

  return (
    <div>
      <div>openingforest</div>
      <div>
        <div>
          <select value={groupX} onChange={(e) => updateGroup(e.target.value)}>
            {Object.keys(openingGroups).map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
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
        <div>
          <select
            value={Filter[toFilter]}
            onChange={(e) =>
              updateToFilter(
                Filter[e.target.value as unknown as number] as unknown as Filter
              )
            }
          >
            {Object.keys(Filter)
              .filter((g) => isNaN(parseInt(g)))
              .map((g) => (
                <option key={g}>{g}</option>
              ))}
          </select>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <Openings openings={openings} />
        <Clusters openings={openings} />
      </div>
    </div>
  );
}
