import { DecisionContext } from './DecisionContext.js';

describe('DecisionContext', () => {
  let context1: DecisionContext;
  let context2: DecisionContext;
  let context3: DecisionContext;

  beforeEach(() => {
    context1 = DecisionContext.create('1', 'First Context');
    context2 = DecisionContext.create('2', 'Second Context');
    context3 = DecisionContext.create('3', 'Third Context');
  });

  afterEach(() => {
    context1.dispose();
    context2.dispose();
    context3.dispose();
  });

  it('should create an instance', () => {
    expect(context1).toBeTruthy();
  });

  it('should set and get id', () => {
    context1.name = '2';
    expect(context1.name).toBe('2');
  });

  it('should set and get title', () => {
    context1.title = 'New Title';
    expect(context1.title).toBe('New Title');
  });

  it('should set and get state', () => {
    context1.state = { isValid: true, __context: 'default' };
    expect(context1.state).toEqual({ isValid: true, __context: 'default' });
  });

  it('should set and get next and previous', () => {

    context1.next = context2;
    context2.previous = context1;

    expect(context1.next).toBe(context2);
    expect(context2.previous).toBe(context1);
  });
  describe('executeReliesOn', () => {

    it('should return true if all reliesOn functions return true', () => {
      context2.relies.on(context1).with(() => true);
      context3.relies.on(context2).with(() => true);

      expect(context2.executeReliesOn(context1)).toBe(true);
      expect(context3.executeReliesOn(context2)).toBe(true);
    });

    it('should return false if any reliesOn function returns false', () => {
      context3.relies.on(context1).with(() => false);
      context3.relies.on(context2).with(() => true);

      expect(context3.executeReliesOn(context2)).toBe(false);
    });

    it('should return true if reliesOn function returns true based on custom logic', () => {
      context1.state = { age: 30, __context: 'default' };

      context2.relies.on(context1).with(() => {
        const age = context1.state['age'] as number;
        return !!(age && age > 25);
      });

      expect(context2.executeReliesOn(context1)).toBe(true);
    });

    it('should return false if reliesOn function returns false based on based on custom logic', () => {
      context1.state = { age: 30, __context: 'default' };

      context2.relies.on(context1).with(() => {
        const age = context1.state['age'] as number;
        return !!(age && age < 25);
      });

      expect(context2.executeReliesOn(context1)).toBe(false);
    });
    describe('elseGoTo', () => {
      it('should set the next context and link the previous context if the execReliesOn fails', () => {
        context2.relies.on(context1).with(() => false).elseGoTo(context3);

        context2.executeReliesOn(context1);
        expect(context1.next).toBe(context3);
      });
    });
    describe('elseEnd', () => {
      it('should set the next context to undefined', () => {
        context1.relies.elseGoTo(context2);
        context1.relies.elseEnd();

        expect(context1.next).toBeUndefined();
      });
    });
  });
});
