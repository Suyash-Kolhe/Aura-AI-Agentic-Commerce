import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  validateSignUpPayload,
  validateSignInPayload,
  formatUserInitials,
} from './auth';

test('validateEmail accurately validates correct and incorrect email addresses', () => {
  assert.equal(validateEmail('test@example.com'), true);
  assert.equal(validateEmail('user.name+tag@domain.co.uk'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('@domain.com'), false);
  assert.equal(validateEmail('user@'), false);
  assert.equal(validateEmail(''), false);
});

test('validatePassword checks length and strength', () => {
  const short = validatePassword('1234');
  assert.equal(short.isValid, false);
  assert.equal(short.strength, 'weak');

  const strong = validatePassword('AuraSecure99!');
  assert.equal(strong.isValid, true);
  assert.equal(strong.strength, 'strong');
});

test('validateSignUpPayload requires full name, valid email, strong password, and terms', () => {
  assert.equal(
    validateSignUpPayload({ name: '', email: 'test@example.com', password: 'Password123!' }).isValid,
    false
  );
  assert.equal(
    validateSignUpPayload({ name: 'Alex Miller', email: 'invalid', password: 'Password123!' }).isValid,
    false
  );
  assert.equal(
    validateSignUpPayload({ name: 'Alex Miller', email: 'alex@example.com', password: '123' }).isValid,
    false
  );
  assert.equal(
    validateSignUpPayload({ name: 'Alex Miller', email: 'alex@example.com', password: 'Password123!', termsAccepted: false }).isValid,
    false
  );
  assert.equal(
    validateSignUpPayload({ name: 'Alex Miller', email: 'alex@example.com', password: 'Password123!', termsAccepted: true }).isValid,
    true
  );
});

test('validateSignInPayload validates email and non-empty password', () => {
  assert.equal(validateSignInPayload({ email: 'alex@example.com', password: 'secretPassword' }).isValid, true);
  assert.equal(validateSignInPayload({ email: 'bademail', password: 'secretPassword' }).isValid, false);
  assert.equal(validateSignInPayload({ email: 'alex@example.com', password: '' }).isValid, false);
});

test('formatUserInitials derives two-letter initials correctly', () => {
  assert.equal(formatUserInitials('Sarah Jenkins'), 'SJ');
  assert.equal(formatUserInitials('Aura'), 'AU');
  assert.equal(formatUserInitials('Marcus Aurelius Antoninus'), 'MA');
  assert.equal(formatUserInitials(''), 'AI');
});
