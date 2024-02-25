import { ReactNode, useState } from "react";

export default function Hideable(props: {
  parent: ReactNode;
  children: ReactNode;
}) {
  const [hidden, updateHidden] = useState(false);
  return (
    <div
      style={{
        display: "inline-block",
        cursor: "pointer",
        border: "2px solid black",
        padding: "2em",
        margin: "2em",
      }}
      onClick={() => updateHidden(!hidden)}
    >
      {props.parent}
      <pre hidden={hidden}>{props.children}</pre>
    </div>
  );
}