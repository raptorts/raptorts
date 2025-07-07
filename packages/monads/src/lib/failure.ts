import { Result } from './result';

export class Failure implements Result<Error> {
  public constructor(
    private readonly anError: Error,
  ) { }

  public get(): Error {
    return this.anError;
  }

  public isFailure(): this is Failure {
    return true;
  }
}
