import {DecisionContextService} from './decision-context.service';
import {DecisionContext} from './DecisionContext';
import {take} from 'rxjs';
import {DecisionContextState} from "./interfaces";

describe('DecisionContextService', () => {
    let service: DecisionContextService;
    let context1: DecisionContext;
    let context2: DecisionContext;
    let context3: DecisionContext;
    beforeEach(() => {
        service = new DecisionContextService();
        context1 = DecisionContext.create('1', 'First Context');
        context2 = DecisionContext.create('2', 'Second Context');
        context3 = DecisionContext.create('3', 'Third Context');
    });
    afterEach(() => service.dispose());
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('addSection', () => {
        it('should add a section', () => {
            service.addContexts([context1]);
            expect(service.head).toBe(context1);
            expect(service.tail).toBe(context1);
            expect(service.length).toBe(1);
        });
        it('should add multiple sections', () => {
            service.addContexts([context1, context2]);
            expect(service.head).toBe(context1);
            expect(service.tail).toBe(context2);
            expect(service.length).toBe(2);
            expect(service.getNext(context1)).toBe(context2);
            expect(service.getPrevious(context2)).toBe(context1);
        });
        it('should find a section by id', () => {
            service.addContexts([context1, context2, context3]);
            const foundSection = service.findSectionByName('2');
            expect(foundSection).toBe(context2);
        });
        it('should remove a section', () => {
            service.addContexts([context1, context2]);
            service.removeSection(context1);
            expect(service.head).toBe(context2);
            expect(service.tail).toBe(context2);
            expect(service.length).toBe(1);
            expect(service.getPrevious(context2)).toBeUndefined();
        });
        it('should remove the last section', () => {
            service.addContexts([context1]);
            service.removeSection(context1);
            expect(service.head).toBeUndefined();
            expect(service.tail).toBeUndefined();
            expect(service.length).toBe(0);
        });
    });
    describe('goToNextSection', () => {
        beforeEach(() => {
            service.addContexts([context1, context2, context3]);
        });
        it('should go to section 3 from section 1 if section 2 reliesOn is false', () => {
            context2.relies.on(context1).with(() => false).elseGoTo(context3);
            service.goToNextSection();
            service.currentSection$.pipe(take(1)).subscribe((section: DecisionContext | undefined) => {
                expect(section).toBe(context3);
            });
        });
        it('should go to section 3 from section 2 if section 2 reliesOn is false', () => {
            context2.relies.on(context1).with(() => true).elseGoTo(context3);
            service.goToNextSection();
            service.currentSection$.pipe(take(1)).subscribe((section: DecisionContext | undefined) => {
                expect(section).toBe(context2);
            });
        });
    });
    describe('goToPreviousSection', () => {
        beforeEach(() => {
            service.addContexts([context1, context2, context3]);
        });
        it('should go to section 1 from section 2', () => {
            service.goToNextSection();
            service.goToPreviousSection();
            service.currentSection$.pipe(take(1)).subscribe((section: DecisionContext | undefined) => {
                expect(section).toBe(context1);
            });
        });
        it('should go to section 1 from section 3 if section 2 reliesOn is false', () => {
            context1.state['age'] = 30;
            context2.relies.on(context1).with(() => {
                const age = context1.state['age'] as number;
                return !!(age && age < 25);
            }).elseGoTo(context3);
            service.goToNextSection();
            service.goToPreviousSection();
            service.currentSection$.pipe(take(1)).subscribe((section: DecisionContext | undefined) => {
                expect(section).toBe(context1);
            });
            /**
             * current is section 1
             * It should go to section 2 from section 1 if section 2 reliesOn is true
             */
            context1.state['age'] = 23;
            service.goToNextSection();
            service.currentSection$.pipe(take(1)).subscribe((section: DecisionContext | undefined) => {
                expect(section).toBe(context2);
            });
        });
    });
    describe('prepareGlobalState', () => {
        afterEach(() => service.dispose());
        it('should call prepareGlobalState when addContexts is called', () => {
            const spy = jest.spyOn(service, 'prepareGlobalState')
            service.addContexts([context1, context2]);
            expect(spy).toHaveBeenCalled();
        });
        it('should update the globalState when a context is updated', () => {
            service.addContexts([context1, context2]);
            context1.state$.next({username: 'John Doe', age: 30, __context: context1.name});
            context2.state$.next({income: 65000, __context: context2.name});
            service.globalState$.pipe(take(1)).subscribe((globalState: DecisionContextState) => {
                expect(globalState).toEqual({
                    username: 'John Doe',
                    age: 30,
                    income: 65000,
                    __context: DecisionContextService.name,
                });
            });
        });
    });
});
