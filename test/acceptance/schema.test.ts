import test from 'ava';
import Api from './api';

let api: Api;

test.beforeEach(() => {
  api = new Api();
});

test('schema acceptance test', (t) => {
  api.setSchema((builder) => {
    return builder.object({
      required: {
        id: builder.number(),
        firstName: builder.string(),
        lastName: builder.string(),
        emailAddress: builder.string(),
        gender: builder.enum('female', 'male'),
      },
      optional: {
        phoneNumber: builder.string(),
        carLicense: builder.boolean(),
      },
    });
  });

  api.verifyFail({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    phoneNumber: '+5060708090',
  });
  api.verifyFail({
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
  });
  api.verifyFail({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
    phoneNumber: 5060708090,
  });
  api.verifyFail({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
    gender: 'fmale',
  });
  api.verifyFail({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    emailAddress: 'john.doe@example.com',
    carLicense: 'yes',
  });

  api.verifyPass({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    emailAddress: 'john.doe@example.com',
  });
  api.verifyPass({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    emailAddress: 'john.doe@example.com',
    carLicense: true,
  });
  api.verifyPass({
    id: 123,
    firstName: 'Anna',
    lastName: 'Doe',
    gender: 'female',
    emailAddress: 'anna.doe@example.com',
    phoneNumber: '+5060708090',
  });
  t.pass();
});
