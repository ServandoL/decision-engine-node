import { DecisionContext } from '../DecisionContext.js';
import { ReliesOnFunction } from '../interfaces.js';

export interface IRelyOnWith {
  context: DecisionContext;
  func: ReliesOnFunction;
}

export interface IRelyOnBuilder {
  on(context: DecisionContext): IRelyOnWithBuilder;

  elseGoTo(context: DecisionContext): this;

  elseEnd(): this;

  build(): Map<string, IRelyOnWith>;
}

export interface IRelyOnWithBuilder {
  with(func: ReliesOnFunction): IRelyOnBuilder;
}
