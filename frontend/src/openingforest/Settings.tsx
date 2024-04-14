const settings = {
  IS_DEV: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
  CHESSBOARD_WIDTH: "18em",
  LICHESS_PARAMS: `variant=standard&speeds=rapid,classical&ratings=${[
    2000, 2200, 2500,
  ].join(",")}`,
  MAX_LICHESS_ATTEMPTS: 5,
  MIN_NODE_RATIO: 0.05,
  SCORE_FLUKE_DISCOUNT: 100,
  SCORE_ATAN_FACTOR: 9,
  SCORE_WIN_FACTOR: 8,
  SCORE_TOTAL_FACTOR: 0.2,
  STARTING_FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  STORAGE_VERSION: "openingforest-v1",
};

export default settings;
