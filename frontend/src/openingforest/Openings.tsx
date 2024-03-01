import { Opening } from "./BuildFromCsv";
import Hideable from "./Hideable";

export default function Openings(props: { openings: Opening[] }) {
  const allCategories = Object.keys(
    props.openings.find((o) => o.name === "<all>")!.categories
  );
  const normalized = Object.fromEntries(
    props.openings.map((o) => [
      o.name,
      {
        ...o,
        normalized: allCategories.map(
          (c) => (1000 * (o.categories[c] || 0)) / o.total
        ),
      },
    ])
  );
  return (
    <div>
      {props.openings.map((obj, i) => (
        <div key={i}>
          <Hideable
            parent={
              <div>
                <div>index: {i + 1}</div>
                <div>opening: {obj.name}</div>
                <div>total: {obj.total}</div>
              </div>
            }
          >
            <div style={{ display: "flex" }}>
              <div>{JSON.stringify(obj.categories, null, 2)}</div>
              <div>
                {JSON.stringify(
                  Object.fromEntries(
                    props.openings
                      .map((o) => ({
                        distance: normalized[obj.name].normalized
                          .map((c, i) => c - normalized[o.name].normalized[i])
                          .map((d) => Math.pow(d, 2))
                          .reduce((a, b) => a + b, 0),
                        ...o,
                      }))
                      .sort((a, b) => a.distance - b.distance)
                      .map((o) => [
                        o.name,
                        `${o.distance.toFixed(4)} (${o.total})`,
                      ])
                      .slice(0, allCategories.length)
                  ),
                  null,
                  2
                )}
              </div>
            </div>
          </Hideable>
        </div>
      ))}
    </div>
  );
}
