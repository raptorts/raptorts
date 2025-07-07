import 'reflect-metadata';
import { ServiceIdentifier, DependencyMetadata } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Inject<T = any>(identifier: ServiceIdentifier<T>): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingDependencies: DependencyMetadata[] =
        Reflect.getMetadata('inject:dependencies', target) || [];
      
    existingDependencies.push({ index: parameterIndex, serviceName: identifier as string });
    existingDependencies.sort((a, b) => a.index - b.index);
    
    Reflect.defineMetadata('inject:dependencies', existingDependencies, target);
  };
}
