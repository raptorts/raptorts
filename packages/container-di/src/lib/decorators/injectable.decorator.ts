import { Container } from '../container';
import { ServiceIdentifier } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Injectable<T = any>(identifier?: ServiceIdentifier<T>): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any) => {
    const serviceId = identifier || target.name || target;
    Container.register(serviceId, target);
    return target;
  };
}
