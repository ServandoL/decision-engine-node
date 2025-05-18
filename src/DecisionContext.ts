import { BehaviorSubject, Subject } from 'rxjs';
import { DecisionContextState } from './interfaces';
import { ReliesOnBuilder } from './builders/ReliesOnBuilder';

export class DecisionContext {
  public static id = 0; // Static property to keep track of the number of instances created
  private readonly _id;
  private _title = '';
  private _state: DecisionContextState;
  private _next?: DecisionContext;
  private _previous?: DecisionContext;
  private _state$: BehaviorSubject<DecisionContextState> = new BehaviorSubject<DecisionContextState>({ __context: 'default' });
  private _reliesOnSuccess$ = new Subject<boolean>();
  private _onDestroy$ = new Subject<void>();
  private _callerContext: DecisionContext | undefined;
  private _ended$ = new Subject<boolean>();
  private _name: string;
  public relies= new ReliesOnBuilder(this);

  protected constructor(name: string, title: string) {
    this._id = ++DecisionContext.id;
    this._name = name;
    this._title = title;
    this._state = { __context: this._name };
  }

  public static create(name: string, title: string): DecisionContext {
    return new DecisionContext(name, title);
  }


  public updateStateValue(key: string, value: any): void {
    this._state[key] = value;
    this._state$.next(this._state);
  }

  /**
   * Checks if all the reliesOn conditions are met.
   * If there are no reliesOn conditions, it returns true to proceed to next.
   * If any of the conditions return false, it returns false.
   * Otherwise, it returns true.
   * @returns {boolean} - true if all conditions are met, false otherwise.
   */
  public executeReliesOn(caller: DecisionContext): boolean {
    const map = this.relies.build();
    if (map.size === 0) {
      this._reliesOnSuccess$.next(true);
      return true;
    }

    for (const value of map.values()) {
      if (!value.func()) {
        this._callerContext = caller;
        this._reliesOnSuccess$.next(false);
        return false;
      }
    }
    this._callerContext = caller;
    this._reliesOnSuccess$.next(true);
    return true;
  }

  public reset() {
    this._state = { __context: this._name };
    this._next = undefined;
    this._previous = undefined;
    this._state$.next(this._state);
    this._reliesOnSuccess$.next(false);
    this._ended$.next(false);
    this._callerContext = undefined;
  }

  /**
   * Cleans up the resources used by the DecisionContext instance.
   * This method should be called when the instance is no longer needed
   * to prevent memory leaks.
   */
  public dispose() {
    this._onDestroy$.next();
    this._onDestroy$.complete();
    this._state$.complete();
  }

  // Getters and Setters for private properties
  get id(): number {
    return this._id;
  }

  get reliesOnSuccess$(): Subject<boolean> {
    return this._reliesOnSuccess$;
  }

  get callerContext(): DecisionContext | undefined {
    return this._callerContext;
  }

  get ended$(): Subject<boolean>{
    return this._ended$
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get onDestroy$(): Subject<void> {
    return this._onDestroy$;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get state(): DecisionContextState {
    return this._state;
  }

  set state(value: DecisionContextState) {
    this._state = value;
  }

  get next(): DecisionContext | undefined {
    return this._next;
  }

  set next(value: DecisionContext | undefined) {
    this._next = value;
  }

  get previous(): DecisionContext | undefined {
    return this._previous;
  }

  set previous(value: DecisionContext | undefined) {
    this._previous = value;
  }

  get state$(): BehaviorSubject<DecisionContextState> {
    return this._state$;
  }

  set state$(value: BehaviorSubject<DecisionContextState>) {
    this._state$ = value;
  }
}
