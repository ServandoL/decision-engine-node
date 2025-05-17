import { ContextConfigManager, DecisionContextConfig } from './ContextConfigManager.js';

describe('ContextConfigManager', () => {
  let config: DecisionContextConfig;
  let manager: ContextConfigManager;

  beforeEach(() => {
    config = {
      contexts: [
        {
          name: 'USER_INFORMATION_SECTION_ID',
          title: 'User Information',
        },
        {
          name: 'DOG_ID',
          title: 'Dog Information',
          reliesOn: [{
            context: 'USER_INFORMATION_SECTION_ID',
            func: 'state.age >= 8',
            elseGoTo: 'PLANT_ID',
          }],
        },
        {
          name: 'CAT_ID',
          title: 'Cat Information',
          reliesOn: [{
            context: 'USER_INFORMATION_SECTION_ID',
            func: 'state.age >= 8',
            elseGoTo: 'PLANT_ID',
          }, {
            context: 'DOG_ID',
            func: 'state.dogType !== "lab"',
            elseGoTo: 'PLANT_ID',
          }],
        },
        {
          name: 'PLANT_ID',
          title: 'Plant Information',
        },
      ],
    };
    manager = ContextConfigManager.createDefaultContext(config);
  });

  it('should initialize contexts', () => {
    const contexts = manager.contexts;
    expect(contexts.length).toBe(4);
    expect(contexts[0].name).toBe('USER_INFORMATION_SECTION_ID');
    expect(contexts[1].name).toBe('DOG_ID');
    expect(contexts[2].name).toBe('CAT_ID');
    expect(contexts[3].name).toBe('PLANT_ID');
  });

  it('should set up dependencies correctly', () => {
    const dogContext = manager.getContext('DOG_ID')!;
    const catContext = manager.getContext('CAT_ID')!;
    const userContext = manager.getContext('USER_INFORMATION_SECTION_ID')!;
    const plantContext = manager.getContext('PLANT_ID')!;

    expect(catContext).toBeDefined();
    expect(dogContext).toBeDefined();
    expect(userContext).toBeDefined();
    expect(plantContext).toBeDefined();

    const dogReliesOn = dogContext.relies.build();
    expect(dogReliesOn.size).toBe(1);

    const dogReliesOnConfig = dogReliesOn.get(userContext.name);
    expect(dogReliesOnConfig).toBeDefined();

    const catReliesOn = catContext.relies.build();
    expect(catReliesOn.size).toBe(2);
    const catReliesOnUser = catReliesOn.get(userContext.name);
    expect(catReliesOnUser).toBeDefined();
  });

  it('should throw an error if context is not found', () => {
    config.contexts.push({
      name: 'INVALID_CONTEXT',
      title: 'Invalid Context',
      reliesOn: [{
        context: 'NON_EXISTENT_CONTEXT',
        func: 'state.age >= 8',
      }],
    });

    expect(() => ContextConfigManager.createDefaultContext(config)).toThrowError('ReliesOn context NON_EXISTENT_CONTEXT not found.');
  });
});
