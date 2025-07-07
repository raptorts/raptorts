export interface DependencyMetadata {
  index: number;
  serviceName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ServiceEntry<T = any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependency: new (...args: any[]) => T;
  factory?: () => T;
  metadata?: DependencyMetadata[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceIdentifier<T = any> = string | symbol | (new (...args: any[]) => T);

export interface ContainerOptions {
  enableCircularDependencyCheck?: boolean;
  cacheFactories?: boolean;
}
