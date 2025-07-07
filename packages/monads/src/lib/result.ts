import { Failure } from './failure';

export interface Result<T> {
  get(): T | Error;
  isFailure(): this is Failure;
}
