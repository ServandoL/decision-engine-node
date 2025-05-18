import {DecisionContext} from '../DecisionContext';
import {ReliesOnBuilder} from './ReliesOnBuilder';
import {take} from 'rxjs';

describe('ReliesOnBuilder', () => {
    let context1: DecisionContext;
    let context2: DecisionContext;
    let context3: DecisionContext;

    beforeEach(() => {
        context1 = DecisionContext.create('context1', 'Context 1');
        context2 = DecisionContext.create('context2', 'Context 2');
        context3 = DecisionContext.create('context3', 'Context 3');
        context1.next = context2;
        context2.previous = context1;
        context2.next = context3;
        context3.previous = context2;
    });

    it('should create an instance', () => {
        const builder = new ReliesOnBuilder(context1);
        expect(builder).toBeTruthy();
    });

    it('should add a reliesOn condition', () => {
        const builder = new ReliesOnBuilder(context1);
        builder.on(context2).with(() => true);
        const map = builder.build();
        expect(map.size).toBe(1);
        expect(map.get(context2.name)?.context).toBe(context2);
    });

    it('should set elseGoTo context if reliesOn fails', () => {
        const builder = context2.relies;
        builder.on(context1).with(() => false).elseGoTo(context3);

        context2.executeReliesOn(context1);
        expect(context1.next).toBe(context3);
        expect(context3.previous).toBe(context1);
    });

    it('should set elseEnd if reliesOn fails', () => {
        const builder = context2.relies;
        builder.on(context1).with(() => false).elseEnd();

        context2.executeReliesOn(context1);
        expect(context1.next).toBeUndefined();
        context1.ended$.pipe(take(1)).subscribe((value: boolean) => {
            expect(value).toBe(true);
        });
    });

    it('should not set elseGoTo context if reliesOn succeeds', () => {
        const builder = context2.relies;
        builder.on(context1).with(() => true).elseGoTo(context3);

        context2.executeReliesOn(context1);
        expect(context1.next).toBe(context2);
        expect(context2.previous).toBe(context1);
        expect(context2.next).toBe(context3);
    });

    it('should not set elseEnd if reliesOn succeeds', () => {
        const builder = context2.relies;
        builder.on(context1).with(() => true).elseEnd();

        context2.executeReliesOn(context1);
        expect(context1.next).toBe(context2);
        expect(context2.previous).toBe(context1);
        context1.ended$.pipe(take(1)).subscribe((value: boolean) => {
            expect(value).toBe(false);
        });
    });
});
