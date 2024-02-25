import { useEffect } from "react";
import { build } from "./BuildFromCsv";

var initialized = false;

export default function Main() {
  const openings = null;
  useEffect(() => {
    if (initialized || openings !== null) return;
    initialized = true;
    build().then(() => alert("built"));
  }, [openings]);
  console.log(openings);
  return (
    <div>
      <div>openingforest</div>
      <pre>{JSON.stringify(openings, null, 2)}</pre>
    </div>
  );
}
