// npm install --save @types/chess.js@0.13.4
// npm install --save chess.js@0.12.0
import Chess, { ChessInstance } from "chess.js";

import settings from "./Settings";
import StorageW from "./StorageW";

type RawMove = {
  san: string;
  white: number;
  black: number;
  draws: number;
  averageRating: number;
};

export type LiMove = {
  raw: RawMove;
  meta: {
    username: string | null;
    fen: string;
    whiteWinPercentage: number;
    total: number;
    probability: number;
    score: number;
  };
};

export default function lichessF(
  fen: string,
  username: string | null
): Promise<LiMove[] | null> {
  const isWhite = isWhiteTurn(fen);

  const url =
    username === null
      ? `https://explorer.lichess.ovh/lichess?fen=${fen}&${settings.LICHESS_PARAMS}`
      : `https://explorer.lichess.ovh/player?player=${username}&color=${
          isWhite ? "white" : "black"
        }&recentGames=0&fen=${fen}&&${settings.LICHESS_PARAMS}`;
  const key = JSON.stringify({
    url,
  });
  const pp = promises[key];
  if (pp) return pp;

  function helper(url: string, attempt: number = 0): Promise<RawMove[] | null> {
    if (attempt > settings.MAX_LICHESS_ATTEMPTS) return Promise.resolve(null);

    const storedMoves = StorageW.get(url);
    if (storedMoves !== null) return Promise.resolve(storedMoves.moves);

    return Promise.resolve()
      .then(() => console.log("fetching", attempt, url))
      .then(() => fetch(url))
      .then((response) =>
        response.ok
          ? response.text().then((text) => {
              const json = JSON.parse(text.trim().split("\n").reverse()[0]);
              const moves = json.moves;
              StorageW.set(url, { moves });
              return moves;
            })
          : new Promise((resolve) =>
              setTimeout(
                () => helper(url, attempt + 1).then((moves) => resolve(moves)),
                1000
              )
            )
      );
  }
  const p = helper(url).then((moves) =>
    moves === null
      ? null
      : Promise.resolve(moves)
          .then((moves) =>
            moves.map((raw) => ({
              raw,
              meta: {
                username,
                fen: getFen(fen, raw.san),
                whiteWinPercentage: raw.white / (raw.black + raw.white),
                total: raw.black + raw.white + raw.draws,
                probability: -1,
                score: -1,
              },
            }))
          )
          .then((moves) => ({
            moves,
            total: moves.map((m) => m.meta.total).reduce((a, b) => a + b, 0),
          }))
          .then(({ moves, total }) =>
            moves.map((move) => ({
              raw: move.raw,
              meta: {
                ...move.meta,
                probability: move.meta.total / total,
              },
            }))
          )
          .then((moves) =>
            moves
              .map((move) => ({
                raw: move.raw,
                meta: {
                  ...move.meta,
                  score: getRawScore(isWhite, move),
                },
              }))
              .sort((a, b) => b.meta.score - a.meta.score)
          )
          .then((moves) =>
            moves.map((move) => ({
              raw: move.raw,
              meta: {
                ...move.meta,
                score: Math.min(
                  420,
                  (100 * move.meta.score) /
                    moves
                      .filter((m) => m.raw.san !== move.raw.san)
                      .map((m) => m.meta.score)[0]
                ),
              },
            }))
          )
  );
  promises[key] = p;
  return p;
}
const promises: { [key: string]: Promise<LiMove[] | null> } = {};

export function getChess(fen: string): ChessInstance {
  // @ts-ignore
  const chess = new Chess();
  chess.load(fen);
  return chess;
}

export function isWhiteTurn(fen: string): boolean {
  return getChess(fen).turn() === "w";
}

export function getFen(startingFen: string, san: string): string {
  const chess = getChess(startingFen);
  chess.move(san);
  return chess.fen();
}

// the final score is the ratio compared to other moves' rawScore
export function getRawScore(isWhite: boolean, move: LiMove): number {
  // ignore draws
  // SCORE_FLUKE_DISCOUNT = 100 discounts positions
  // that are very rare
  const winRate =
    (isWhite ? move.raw.white : move.raw.black) /
    (settings.SCORE_FLUKE_DISCOUNT + move.raw.black + move.raw.white);
  // use atan around 0.5 because the difference between a
  // 50-60% win rate is larger than the difference
  // between a 70-80% win rate
  // SCORE_ATAN_FACTOR = 9 normalizes this window, but
  // perhaps a different value would be better :shrug:
  const winScore = Math.atan(settings.SCORE_ATAN_FACTOR * (winRate - 0.5));
  // SCORE_WIN_FACTOR = 8 puts the winScore as an exponent
  // so that ratios will do nice things
  const powerScore = Math.pow(settings.SCORE_WIN_FACTOR, winScore);
  // SCORE_TOTAL_FACTOR = 0.2 rewards more common moves, but not too much
  const rawScore =
    powerScore * Math.pow(move.meta.total, settings.SCORE_TOTAL_FACTOR);
  return rawScore;
}
