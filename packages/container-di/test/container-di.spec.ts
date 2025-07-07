import 'reflect-metadata';
import { Container, Injectable, Inject } from '../src';

@Injectable()
class TestService {}

@Injectable()
class DependentService {
  constructor(@Inject('TestService') public testService: TestService) {}
}

@Injectable('ServiceA')
class ServiceA {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(@Inject('ServiceB') public serviceB: any) {}
}

@Injectable('ServiceB')
class ServiceB {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(@Inject('ServiceA') public serviceA: any) {}
}

@Injectable()
class MultiDependencyService {
  constructor(
    @Inject('TestService') public service1: TestService,
    @Inject('DependentService') public service2: DependentService
  ) {}
}

describe('Container', () => {
  beforeEach(() => {
    Container.clean();
  });

  afterAll(() => {
    Container.clean();
  });

  it('should register and resolve a dependency', () => {
    Container.register('TestService', TestService);
    const instance = Container.resolve<TestService>('TestService');

    expect(instance).toBeInstanceOf(TestService);
  });

  it('should throw an error if dependency is not found', () => {
    expect(() => Container.resolve('NonExistentService')).toThrow('Dependency NonExistentService not found.');
  });

  it('should resolve a singleton instance', () => {
    Container.register('TestService', TestService);
    const instance1 = Container.resolve<TestService>('TestService');
    const instance2 = Container.resolve<TestService>('TestService');

    expect(instance1).toBe(instance2);
  });

  it('should resolve dependencies with sub-dependencies using decorators', () => {
    Container.register('TestService', TestService);
    Container.register('DependentService', DependentService);
    
    const instance = Container.resolve<DependentService>('DependentService');

    expect(instance).toBeInstanceOf(DependentService);
    expect(instance.testService).toBeInstanceOf(TestService);
  });

  it('should detect circular dependencies', () => {
    Container.register('ServiceA', ServiceA);
    Container.register('ServiceB', ServiceB);
    
    expect(() => Container.resolve('ServiceA')).toThrow(/Circular dependency detected/);
  });

  it('should disable circular dependency check when configured', () => {
    Container.configure({ enableCircularDependencyCheck: false });
    Container.register('ServiceA', ServiceA);
    Container.register('ServiceB', ServiceB);
    
    expect(() => Container.resolve('ServiceA')).toThrow(/Maximum call stack/);
  });

  it('should resolve multiple dependencies in constructor', () => {
    Container.register('TestService', TestService);
    Container.register('DependentService', DependentService);
    Container.register('MultiDependencyService', MultiDependencyService);
    
    const instance = Container.resolve<MultiDependencyService>('MultiDependencyService');

    expect(instance).toBeInstanceOf(MultiDependencyService);
    expect(instance.service1).toBeInstanceOf(TestService);
    expect(instance.service2).toBeInstanceOf(DependentService);
  });

  it('should cache metadata for performance', () => {
    const spy = jest.spyOn(Reflect, 'getMetadata');
    
    Container.register('TestService', TestService);
    Container.resolve('TestService');
    Container.register('TestService2', TestService);
    Container.resolve('TestService2');

    // Should be called only once because TestService metadata is cached
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('should clear all dependencies and singletons', () => {
    Container.register('TestService', TestService);
    Container.resolve<TestService>('TestService');
    Container.clean();
    expect(() => Container.resolve('TestService')).toThrow('Dependency TestService not found.');
  });

  it('should use factory cache when enabled', () => {
    Container.configure({ cacheFactories: true });
    Container.register('TestService', TestService);
    Container.register('DependentService', DependentService);
    
    const instance1 = Container.resolve<DependentService>('DependentService');
    expect(instance1).toBeInstanceOf(DependentService);
  });
});
