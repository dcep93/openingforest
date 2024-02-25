import { Opening } from "./BuildFromCsv";
import by_move from "./by_move.json";
import by_theme from "./by_theme.json";

export const openingGroups: { [k: string]: Opening[] } = {
  by_theme,
  by_move,
};
