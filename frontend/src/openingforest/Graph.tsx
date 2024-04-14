import { useEffect, useState } from "react";
import lichessF, { LiMove, isWhiteTurn } from "./Lichess";
import { OpeningMovesType } from "./OpeningGroups";
import settings from "./Settings";

type TreeType = LiMove & {
  children: TreeType[] | null;
};

type RootType = {
  fen: string;
  isWhite: boolean;
  lichessUsername: string | null;
  cutoffRatio: number;
};

export default function Graph(props: { openingMoves: OpeningMovesType }) {
  const [tree, updateTree] = useState<TreeType | null>(null);
  const [root, _updateRoot] = useState<RootType>({
    fen: settings.STARTING_FEN,
    isWhite: true,
    lichessUsername: null,
    cutoffRatio: settings.MIN_NODE_RATIO,
  });
  const updateRoot = (newRoot: any) =>
    _updateRoot(Object.assign({}, root, newRoot));
  useEffect(() => {
    updateTree(null);
    fetchTree(root).then(updateTree);
  }, [root]);
  return (
    <div>
      <div>
        <span>lichess username: </span>
        <form
          style={{ display: "inline" }}
          onSubmit={(e) => {
            e.preventDefault();
            updateRoot({
              lichessUsername: (e.target as any)[0].value,
            });
          }}
        >
          <input
            name={"lichessRef"}
            style={{ width: "4em" }}
            autoComplete={"on"}
          />
        </form>
      </div>
      <div>
        <span>cutoffRatio: </span>
        <form
          style={{ display: "inline" }}
          onSubmit={(e) => {
            e.preventDefault();
            updateRoot({
              cutoffRatio: parseInt((e.target as any)[0].value),
            });
          }}
        >
          <input
            style={{ width: "4em" }}
            type={"number"}
            defaultValue={root.cutoffRatio}
          />
        </form>
      </div>{" "}
      <div>
        {[true, false].map((t) => (
          <div key={t.toString()}>
            <label>
              <input
                type="radio"
                name="isWhite"
                checked={t === root.isWhite}
                onChange={() =>
                  updateRoot({
                    isWhite: t,
                  })
                }
              />
              {t ? "white" : "black"}
            </label>
          </div>
        ))}
      </div>
      <div>
        <pre>{JSON.stringify({ tree }, null, 2)}</pre>
      </div>
    </div>
  );
}

function fetchTree(root: RootType): Promise<TreeType> {
  function helper(fen: string, threshold: number): Promise<TreeType[] | null> {
    if (threshold >= 1) return Promise.resolve(null);
    return lichessF(
      fen,
      isWhiteTurn(fen) === root.isWhite ? root.lichessUsername : null
    )
      .then((children) => ({
        children,
        total: children.map((child) => child.total).reduce((a, b) => a + b, 0),
      }))
      .then(({ children, total }) =>
        children.map((child) =>
          helper(child.fen, (threshold * total) / child.total).then(
            (children) => ({
              children,
              ...child,
            })
          )
        )
      )
      .then((promises) => Promise.all(promises));
  }

  return helper(root.fen, root.cutoffRatio).then((children) => ({
    children,

    fen: root.fen,
    san: "root",
    white: -1,
    black: -1,
    draws: -1,
    averageRating: -1,

    whiteWinPercentage: -1,
    total: -1,
    score: -1,
  }));
}
