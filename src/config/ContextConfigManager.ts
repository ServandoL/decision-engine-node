import { DecisionContext } from '../DecisionContext.js';

export interface DecisionContextConfig {
  contexts: IContextConfig[]; // array of context configurations
}

/**
 * reliesOn Property config fields
 */
export interface ReliesOnConfig {
  context: string; // the name of the context
  func: string; // the function to call when the reliesOn condition is met
  elseGoTo?: string; // the context to go to if the reliesOn condition is false
  elseEnd?: boolean; // if true, end the decision context if the reliesOn condition is false
}

export interface IContextConfig {
  name: string;
  title: string;
  reliesOn?: ReliesOnConfig[];
}

export class ContextConfigManager<TContext extends DecisionContext = DecisionContext, TConfig extends DecisionContextConfig = DecisionContextConfig> {
  private _contexts: Map<string, TContext> = new Map();
  private static _instance: ContextConfigManager;
  protected _config: TConfig | undefined;

  public static get instance(): ContextConfigManager {
    if (!ContextConfigManager._instance) {
      throw new Error('ContextConfigManager is not initialized. Please create it first.');
    }
    return ContextConfigManager._instance;
  }

  public static createDefaultContext(config: DecisionContextConfig): ContextConfigManager {
    const instance = new ContextConfigManager();
    instance._config = config;
    instance.initializeContexts();
    instance.setDependencies();
    ContextConfigManager._instance = instance;
    return instance;
  }

  /**
   * Initializes the contexts based on the provided configuration.
   * This method creates a context for each configuration in the contexts array.
   * @protected
   */
  protected initializeContexts() {
    if (!this._config) {
      throw new Error('ContextConfigManager is not initialized with a configuration.');
    }
    this._config.contexts.forEach(config => {
      const parsedConfig = this.parseContextConfig(config);
      const context = this.createContext(parsedConfig);
      this._contexts.set(config.name, context);
    });
  }

  /**
   * Creates a new context based on the provided name and title.
   * This method should be overridden in subclasses to create specific types of contexts.
   * @param config
   * @protected
   */
  protected createContext(config: IContextConfig): TContext {
    return DecisionContext.create(config.name, config.title) as TContext;
  }

  protected setDependencies() {
    if (!this._config) {
      throw new Error('ContextConfigManager is not initialized with a configuration.');
    }
    this._config.contexts.forEach(config => {
      if (config.reliesOn?.length) {
        config.reliesOn.forEach((reliesOnConfig) => {

          const context = this._contexts.get(config.name);
          if (!context) {
            throw new Error(`Context ${config.name} not found.`);
          }

          const reliesOnContext = this._contexts.get(reliesOnConfig.context);
          if (!reliesOnContext) {
            throw new Error(`ReliesOn context ${reliesOnConfig.context} not found.`);
          }

          // Parse the reliesOn configuration
          const parseReliesOnConfig = this.parseReliesOnConfig(reliesOnConfig);
          const fn = new Function('reliesOn', `return ${parseReliesOnConfig.func}`); // Create a function from the string
          // Set up the reliesOn condition
          context.relies.on(reliesOnContext).with(() => {
            return fn(reliesOnContext.state);
          });

          if (reliesOnConfig.elseGoTo) {
            const elseGoToContext = this._contexts.get(reliesOnConfig.elseGoTo);
            if (!elseGoToContext) {
              throw new Error(`ElseGoTo context ${reliesOnConfig.elseGoTo} not found.`);
            }
            context.relies.elseGoTo(elseGoToContext);
          }

          if (reliesOnConfig.elseEnd) {
            context.relies.elseEnd();
          }
        });
      }
    });
  }

  protected parseReliesOnConfig(config: ReliesOnConfig) {
    if (!config.context || !config.func) {
      throw new Error('Invalid reliesOn configuration: context and func are required.');
    }
    return config;
  }

  protected parseContextConfig(config: IContextConfig): IContextConfig {
    if (!config.name || !config.title) {
      throw new Error('Invalid context configuration: id and title are required.');
    }
    if (config.reliesOn && !Array.isArray(config.reliesOn)) {
      throw new Error('Invalid reliesOn configuration.');
    }
    return config;
  }

  public get contexts(): TContext[] {
    return Array.from(this._contexts.values());
  }

  public getContext(name: string): TContext | undefined {
    return this._contexts.get(name);
  }
}
