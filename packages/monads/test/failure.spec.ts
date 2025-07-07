import { Failure } from '../src';
import { faker } from '@faker-js/faker';

describe('Failure', () => {
  let anError: Error;

  beforeAll(() => {
    anError = new Error(faker.string.sample());
  });

  it('isFailure', () => {
    const anInstance = new Failure(
      anError,
    );

    expect(anInstance.isFailure()).toBe(true);
  });

  it('get', () => {
    const anInstance = new Failure(
      anError,
    );

    expect(anInstance.get()).toBe(anError);
  });
});
