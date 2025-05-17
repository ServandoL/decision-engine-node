import { BehaviorSubject, Observable, of } from 'rxjs';
import { DecisionContext } from './DecisionContext.js';
import { DecisionContextState } from './interfaces.js';

/**
 * should give you an input to the next section
 * it should know which sections you are in
 * should only be called after the entire form is validated to call for next
 */

/**
 * This service is responsible for managing the context of the stepper
 * Implemented as a doubly-linked list
 */
export class DecisionContextService<T extends DecisionContext = DecisionContext> {
  private _head?: T;
  private _tail?: T;
  private _length = 0;
  protected _currentSection = new BehaviorSubject<T | undefined>(undefined);
  private readonly _sectionMap = new Map<number, T>();

  /**
   * will contain all the state values of each context
   * @private
   */
  private readonly _globalState$ = new BehaviorSubject<DecisionContextState>({ __context: DecisionContextService.name });

  /**
   * The global state observable that can be used to track the state of the decision context
   * across all sections.
   */
  public get globalState$(): BehaviorSubject<DecisionContextState> {
    return this._globalState$;
  }


  public get sectionMap(): Map<number, T> {
    return this._sectionMap;
  }

  public get head(): T | undefined {
    return this._head;
  }

  public get tail(): T | undefined {
    return this._tail;
  }

  public get length(): number {
    return this._length;
  }

  public get currentSection$(): Observable<T | undefined> {
    return this._currentSection.asObservable();
  }

  public getAllSections(): Observable<Map<string, T>> {
    const sectionsMap = new Map<string, T>();
    let currentSection = this._head;

    while (currentSection) {
      sectionsMap.set(currentSection.name, currentSection);
      currentSection = currentSection.next as T | undefined;
    }

    return of(sectionsMap);
  }

  public findSectionByName(name: string): T | undefined {
    let currentSection = this._head;

    while (currentSection) {
      if (currentSection.name === name) {
        return currentSection;
      }
      currentSection = currentSection.next as T | undefined;
    }

    return undefined;
  }

  /**
   * Adds a list of sections to the decision context
   * Should be called during app startup or when the decision context is reset
   * @param sections
   */
  public addContexts(sections: T[]): void {
    for (const section of sections) {
      if (!this._head) {
        this._head = section;
        this._tail = section;
        this._currentSection.next(section);
      } else {
        if (this._tail) {
          this._tail.next = section;
          section.previous = this._tail;
          this._tail = section;
        }
      }
      this._sectionMap.set(section.id, section);
      this._length++;
    }
    this.prepareGlobalState();
  }

  public removeSection(section: T): void {
    if (section.previous) {
      section.previous.next = section.next;
    } else {
      this._head = section.next as T | undefined;
    }

    if (section.next) {
      section.next.previous = section.previous;
    } else {
      this._tail = section.previous as T | undefined;
    }

    section.next = undefined;
    section.previous = undefined;
    this._length--;
  }

  public getNext(section: T): T | undefined {
    return section.next as T | undefined;
  }

  public getPrevious(section: T): T | undefined {
    return section.previous as T | undefined;
  }

  public goToNextSection(): void {
    const currentSection = this._currentSection.value;
    const nextSection = this._currentSection.value?.next;
    if (currentSection && nextSection) {
      const isValid = nextSection.executeReliesOn(currentSection);
      if (isValid) {
        this._currentSection.next(nextSection as T);
      } else {
        this._currentSection.next(currentSection.next as T | undefined);
      }
    }
  }

  public goToPreviousSection(): void {
    const currentSection = this._currentSection.value;
    if (currentSection && currentSection.previous) {
      /**
       * Reset the previous section's next to the original next
       */
      const previous = currentSection.previous;
      const key = previous.id + 1;
      const originalNext = this._sectionMap.get(key);
      previous.next = originalNext as T;

      this._currentSection.next(previous as T);
    }
  }

  public reset() {
    this.dispose();
    this._length = 0;
    this._currentSection.next(undefined);
    this.sectionMap.forEach((section) => {
      section.reset();
      console.log(section);
    });
    this.addContexts(Array.from(this._sectionMap.values()));
  }

  public dispose() {
    while (this._head) {
      const nextSection = this._head.next as T | undefined;
      this._head.dispose();
      this._head = nextSection;
    }
  }

  /**
   * Prepares the global state by subscribing to each section's state observable
   * @private
   */
  public prepareGlobalState(): void {
    this._sectionMap.forEach((section) => {
      section.state$.subscribe(
        (state: DecisionContextState) => {
          this._globalState$.next({
            ...this._globalState$.value,
            ...state,
            __context: DecisionContextService.name,
          });
        },
      );
    });
  }
}
