import Chess from "chess.js";

import settings from "./Settings";
import StorageW from "./StorageW";

export type LiMove = {
  san: string;
  white: number;
  black: number;
  draws: number;
  averageRating: number;

  fen: string;
  whiteWinPercentage: number;
  total: number;
  score: number;
};

export function isWhiteTurn(fen: string): boolean {
  return fen.split(" ")[1] === "w";
}

export default function lichessF(
  fen: string,
  username: string | null
): Promise<LiMove[]> {
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
  if (pp) {
    return pp;
  }
  const p = helper(url)
    .then((moves) =>
      moves
        .map((move: LiMove) => ({
          ...move,
          fen: getFen(fen, move.san),
          whiteWinPercentage: move.white / (move.black + move.white),
          total: move.black + move.white + move.draws,
        }))
        .map((move: LiMove) =>
          Promise.resolve()
            .then(() => getRawScore(isWhite, move))
            .then((score) => ({
              ...move,
              score,
            }))
        )
    )
    .then((movePromises: Promise<LiMove>[]) => Promise.all(movePromises))
    .then((moves: LiMove[]) =>
      moves.map((move) => ({
        ...move,
        score: Math.min(
          420,
          (100 * move.score) /
            moves
              .filter((m) => m.san !== move.san)
              .map((m) => m.score)
              .sort((a, b) => b - a)[0]
        ),
      }))
    );
  promises[key] = p;
  return p;
}
const promises: { [key: string]: Promise<LiMove[]> } = {};

function helper(url: string, attempt: number = 0): Promise<LiMove[]> {
  if (attempt > settings.MAX_LICHESS_ATTEMPTS) return Promise.resolve([]);

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
            StorageW.set(url, json);
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

export function getFen(startingFen: string, san: string): string {
  // @ts-ignore
  const chess: ChessInstance = new Chess();
  chess.load(startingFen);
  chess.move(san);
  return chess.fen();
}

// the final score is the ratio compared to other moves' rawScore
export function getRawScore(isWhite: boolean, move: LiMove): number {
  // ignore draws
  // SCORE_FLUKE_DISCOUNT = 100 discounts positions
  // that are very rare
  const winRate =
    (isWhite ? move.white : move.black) /
    (settings.SCORE_FLUKE_DISCOUNT + move.black + move.white);
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
    powerScore * Math.pow(move.total, settings.SCORE_TOTAL_FACTOR);
  return rawScore;
}
