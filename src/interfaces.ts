export type ReliesOnFunction = () => boolean;

export interface DecisionContextState {
  __context: string;

  [key: string]: any;
}
