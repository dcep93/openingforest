export type Tactic = {
  id: string;
  opening: string;
  turn: number;
  category: string;
};

export function getTactics(): Promise<Tactic[]> {
  return Promise.resolve([]);
}
