import {DecisionContext} from '../DecisionContext';
import {takeUntil} from 'rxjs';
import {IRelyOnWith, IRelyOnWithBuilder} from './interfaces';
import {ReliesOnWithBuilder} from './ReliesOnWithBuilder';

export class ReliesOnBuilder {
    private readonly _context: DecisionContext;
    private readonly _reliesOnMap: Map<string, IRelyOnWith>;

    constructor(context: DecisionContext) {
        this._context = context;
        this._reliesOnMap = new Map<string, IRelyOnWith>();
    }

    public on(context: DecisionContext): IRelyOnWithBuilder {
        this._reliesOnMap.set(context.name, {context, func: () => true});
        return new ReliesOnWithBuilder(this, this._reliesOnMap, context.name);
    }

    public elseGoTo(context: DecisionContext): this {
        this._context.reliesOnSuccess$.pipe(takeUntil(this._context.onDestroy$)).subscribe((success: boolean) => {
            if (this._context.callerContext) {
                if (!success) {
                    this._context.callerContext.next = context;
                    context.previous = this._context.callerContext;
                } else {
                    this._context.callerContext.next = this._context;
                    this._context.previous = this._context.callerContext;
                }
            }
        });
        return this;
    }

    public elseEnd(): this {
        this._context.reliesOnSuccess$.pipe(takeUntil(this._context.onDestroy$)).subscribe((success: boolean) => {
            if (this._context.callerContext) {
                if (!success) {
                    this._context.callerContext.next = undefined;
                    this._context.ended$.next(true);
                }
            }
        });
        return this;
    }

    public build(): Map<string, IRelyOnWith> {
        return this._reliesOnMap;
    }
}
