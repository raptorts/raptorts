import 'reflect-metadata';
import { ServiceEntry, ServiceIdentifier, DependencyMetadata, ContainerOptions } from "./types";

export class Container {
  private static readonly dependencies = new Map<ServiceIdentifier, ServiceEntry>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static readonly singletons = new Map<ServiceIdentifier, any>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private static readonly metadataCache = new Map<Function, DependencyMetadata[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static readonly factoryCache = new Map<ServiceIdentifier, () => any>();
  private static readonly resolutionStack = new Set<ServiceIdentifier>();
  private static options: ContainerOptions = {
    enableCircularDependencyCheck: true,
    cacheFactories: true
  };

  public static configure(options: ContainerOptions): void {
    this.options = { ...this.options, ...options };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static register<T>(identifier: ServiceIdentifier<T>, dependency: new (...args: any[]) => T): void {
    const metadata = this.getMetadata(dependency);
    const entry: ServiceEntry<T> = { dependency, metadata };
    
    this.dependencies.set(identifier, entry);
    
    if (this.options.cacheFactories && metadata.length > 0) {
      this.factoryCache.set(identifier, this.createFactory(identifier, dependency, metadata));
    }
  }
  
  public static resolve<T>(identifier: ServiceIdentifier<T>): T {
    if (this.singletons.has(identifier)) {
      return this.singletons.get(identifier);
    }

    if (this.options.enableCircularDependencyCheck) {
      if (this.resolutionStack.has(identifier)) {
        throw new Error(`Circular dependency detected: ${Array.from(this.resolutionStack).join(' -> ')} -> ${String(identifier)}`);
      }
      this.resolutionStack.add(identifier);
    }

    try {
      const instance = this.createInstance<T>(identifier);
      this.singletons.set(identifier, instance);
      return instance;
    } finally {
      if (this.options.enableCircularDependencyCheck) {
        this.resolutionStack.delete(identifier);
      }
    }
  }

  private static createInstance<T>(identifier: ServiceIdentifier<T>): T {
    const entry = this.dependencies.get(identifier);
    
    if (!entry) {
      throw new Error(`Dependency ${String(identifier)} not found.`);
    }

    if (this.factoryCache.has(identifier)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.factoryCache.get(identifier)!();
    }

    const { dependency, metadata = [] } = entry;

    if (metadata.length === 0) {
      return typeof dependency === 'function' && dependency.prototype
        ? new dependency()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : dependency as any;
    }

    const args = new Array(metadata.length);
    for (const { serviceName, index } of metadata) {
      args[index] = this.resolve(serviceName);
    }

    return new dependency(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private static getMetadata(dependency: Function): DependencyMetadata[] {
    if (this.metadataCache.has(dependency)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.metadataCache.get(dependency)!;
    }

    const metadata = Reflect.getMetadata('inject:dependencies', dependency) ?? [];
    this.metadataCache.set(dependency, metadata);
    return metadata;
  }

  private static createFactory<T>(
    identifier: ServiceIdentifier<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependency: new (...args: any[]) => T,
    metadata: DependencyMetadata[]
  ): () => T {
    const argResolvers = metadata.map(({ serviceName }) => 
      () => this.resolve(serviceName)
    );

    return () => {
      const args = new Array(metadata.length);
      for (let i = 0; i < metadata.length; i++) {
        args[metadata[i].index] = argResolvers[i]();
      }
      return new dependency(...args);
    };
  }

  public static clean(): void {
    this.dependencies.clear();
    this.singletons.clear();
    this.metadataCache.clear();
    this.factoryCache.clear();
    this.resolutionStack.clear();
  }
}
