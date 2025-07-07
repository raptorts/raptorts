import { Failure } from './failure';
import { Result } from './result';

export class Success<T> implements Result<T> {
  public constructor(
    private readonly aValue: T,
  ) { }

  public get(): T {
    return this.aValue;
  }

  public isFailure(): this is Failure {
    return false;
  }
}
