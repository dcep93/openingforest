import { useEffect } from "react";
import { build } from "./BuildFromCsv";
import openings from "./data.json";

var initialized = true;

export default function Main() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    build().then(() => alert("built"));
  }, []);
  return (
    <div>
      <div>openingforest</div>
      <pre>{JSON.stringify(openings, null, 2)}</pre>
    </div>
  );
}
