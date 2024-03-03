import Bubble from "./Bubble";
import { Opening } from "./BuildFromCsv";

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
        <div key={i} id={obj.name}>
          <Bubble
            parent={
              <div>
                <div>index: {i + 1}</div>
                <div>opening: {obj.name}</div>
                <div>total: {obj.total}</div>
              </div>
            }
          >
            <div style={{ display: "flex" }}>
              <table>
                {Object.entries(obj.categories).map(([c, t]) => (
                  <tr key={c}>
                    <td>
                      {t} ({(t / obj.total).toFixed(6)})
                    </td>
                    <td>{c}</td>
                  </tr>
                ))}
              </table>
              <table>
                {props.openings
                  .map((o) => ({
                    distance: normalized[obj.name].normalized
                      .map((c, i) => c - normalized[o.name].normalized[i])
                      .map((d) => Math.pow(d, 2))
                      .reduce((a, b) => a + b, 0),
                    ...o,
                  }))
                  .sort((a, b) => a.distance - b.distance)
                  .slice(0, allCategories.length)
                  .map((o) => (
                    <tr key={o.name}>
                      <td>
                        {o.distance.toFixed(4)} ({o.total})
                      </td>
                      <td>
                        <a href={`#${o.name}`}>{o.name}</a>
                      </td>
                    </tr>
                  ))}
              </table>
            </div>
          </Bubble>
        </div>
      ))}
    </div>
  );
}
