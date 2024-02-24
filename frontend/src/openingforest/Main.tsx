import { useEffect, useState } from "react";
import { Opening, build } from "./BuildFromCsv";

var initialized = false;

export default function Main() {
  const cachedOpenings = null;
  const [openings, updateOpenings] = useState<Opening[] | null>(cachedOpenings);
  useEffect(() => {
    if (initialized || openings !== null) return;
    initialized = true;
    build().then(updateOpenings);
  }, [openings]);
  return (
    <div>
      <div>openingforest</div>
      <pre>{JSON.stringify(openings, null, 2)}</pre>
    </div>
  );
}
