import { ReliesOnBuilder } from './ReliesOnBuilder.js';
import {IRelyOnWith, IRelyOnWithBuilder} from "./interfaces.js";
import {ReliesOnFunction} from "../interfaces.js";

export class ReliesOnWithBuilder implements IRelyOnWithBuilder {
  private readonly _builder: ReliesOnBuilder;

  constructor(builder: ReliesOnBuilder, private _reliesOn: Map<string, IRelyOnWith>, private _name: string) {
    this._builder = builder;
  }

  public with(func: ReliesOnFunction): ReliesOnBuilder {
    const lastContext = this._reliesOn.get(this._name);
    if (lastContext) {
      lastContext.func = func;
    }
    return this._builder;
  }
}
