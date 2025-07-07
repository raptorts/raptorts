import { Success } from '../src';
import { faker } from '@faker-js/faker';

describe('Sucess', () => {
  let aBirthdate: Date;

  beforeAll(() => {
    aBirthdate = faker.date.birthdate();
  });

  it('isFailure', () => {
    const anInstance = new Success(
      aBirthdate,
    );

    expect(anInstance.isFailure()).toBe(false);
  });

  it('get', () => {
    const anInstance = new Success(
      aBirthdate,
    );

    expect(anInstance.get()).toBe(aBirthdate);
  });
});
