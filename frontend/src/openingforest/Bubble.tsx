import { ReactNode, useState } from "react";

export default function Bubble(props: {
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
      onClick={() => false && updateHidden(!hidden)}
    >
      {props.parent}
      <pre hidden={hidden}>{props.children}</pre>
    </div>
  );
}
