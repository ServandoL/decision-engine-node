import { ReliesOnBuilder } from './ReliesOnBuilder';
import { ReliesOnWithBuilder } from './ReliesOnWithBuilder';
import { DecisionContext } from '../DecisionContext';
import { IRelyOnWith } from './interfaces';

describe('ReliesOnWithBuilder', () => {
  let reliesOnBuilder: ReliesOnBuilder;
  let reliesOnWithBuilder: ReliesOnWithBuilder;
  let reliesOnMap: Map<string, IRelyOnWith>;

  beforeEach(() => {
    reliesOnBuilder = new ReliesOnBuilder(
      DecisionContext.create('context1', 'Context 1'),
    );
    reliesOnMap = new Map<string, IRelyOnWith>();
    reliesOnWithBuilder = new ReliesOnWithBuilder(
      reliesOnBuilder,
      reliesOnMap,
      'context2',
    );
  });

  it('should create an instance', () => {
    expect(reliesOnWithBuilder).toBeTruthy();
  });

  it('should add a reliesOn function', () => {
    const func = () => true;
    reliesOnMap.set('context2', {
      context: DecisionContext.create('context2', 'Context 2'),
      func: () => false,
    });
    reliesOnWithBuilder.with(func);
    expect(reliesOnMap.get('context2')?.func).toBe(func);
  });

  it('should return the ReliesOnBuilder instance', () => {
    const result = reliesOnWithBuilder.with(() => true);
    expect(result).toBe(reliesOnBuilder);
  });

  it('should not throw if context is not found in map', () => {
    expect(() => reliesOnWithBuilder.with(() => true)).not.toThrow();
  });
});
