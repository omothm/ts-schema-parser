import test from 'ava';
import { Schema as S } from './schema';

test('array: should throw on non-array value', (t) => {
  const schema = S.array(S.string());

  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
});

test('array: should throw on heterogeneous array', (t) => {
  const schema1 = S.array(S.string());
  t.true(t.throws(() => schema1.parse([123])) instanceof TypeError);
  t.true(t.throws(() => schema1.parse(['abc', 'def', 123])) instanceof TypeError);
  t.true(t.throws(() => schema1.parse(['abc', 123, 'def'])) instanceof TypeError);

  const schema2 = S.array(S.number());
  t.true(t.throws(() => schema2.parse(['123'])) instanceof TypeError);
  t.true(t.throws(() => schema2.parse(['abc', 123])) instanceof TypeError);
  t.true(t.throws(() => schema2.parse([123, 'def'])) instanceof TypeError);

  const schema3 = S.array(S.object({ required: { code: S.string(), link: S.string() } }));
  t.true(
    t.throws(() => schema3.parse([{ code: '123', link: 'abc' }, { code: '456' }])) instanceof
      TypeError,
  );
  t.true(
    t.throws(() =>
      schema3.parse([
        { code: '123', link: 'abc' },
        { code: '456', link: 123 },
      ]),
    ) instanceof TypeError,
  );
});

test('array: should parse empty array', (t) => {
  const schema = S.array(S.string());
  const parsed = schema.parse([]);
  t.deepEqual(parsed, []);
});

test('array: should parse non-empty array', (t) => {
  const schema1 = S.array(S.string());
  const parsed1 = schema1.parse(['abc', 'def', 'ghi']);
  t.deepEqual(parsed1, ['abc', 'def', 'ghi']);

  const schema2 = S.array(S.object({ required: { code: S.string(), link: S.string() } }));
  const parsed2 = schema2.parse([
    { code: '123', link: 'abc' },
    { code: '456', link: 'def' },
  ]);
  t.deepEqual(parsed2, [
    { code: '123', link: 'abc' },
    { code: '456', link: 'def' },
  ]);
});

test('boolean: should throw on non-boolean value', (t) => {
  const schema = S.boolean();
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('boolean: should parse boolean', (t) => {
  const schema = S.boolean();
  const parsed = schema.parse(true);
  t.is(parsed, true);
});

test('enum: should throw on non-enum values', (t) => {
  const schema = S.enum('a', 'b', 'c');

  t.true(t.throws(() => schema.parse('d')) instanceof TypeError);

  let parsed = schema.parse('a');
  t.is(parsed, 'a');
  parsed = schema.parse('b');
  t.is(parsed, 'b');
  parsed = schema.parse('c');
  t.is(parsed, 'c');
});

test('number: should throw on non-number value', (t) => {
  const schema = S.number();
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('number: should parse number', (t) => {
  const schema = S.number();
  const parsed = schema.parse(123);
  t.is(parsed, 123);
});

test('object: should throw on non-object value', (t) => {
  const schema = S.object();
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('object: should parse empty object', (t) => {
  const schema1 = S.object();
  const parsed1 = schema1.parse({});
  t.deepEqual(parsed1, {});

  const schema2 = S.object({ required: {} });
  const parsed2 = schema2.parse({});
  t.deepEqual(parsed2, {});

  const schema3 = S.object({ optional: {} });
  const parsed3 = schema3.parse({});
  t.deepEqual(parsed3, {});

  const schema4 = S.object({ required: {}, optional: {} });
  const parsed4 = schema4.parse({});
  t.deepEqual(parsed4, {});
});

test('object: should parse object with 1 required prop', (t) => {
  const schema = S.object({ required: { title: S.string() } });

  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ title: 123 })) instanceof TypeError);

  const parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });
});

test('object: should parse object with 1+ required prop', (t) => {
  const schema = S.object({ required: { title: S.string(), body: S.string() } });

  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ title: '123' })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ body: 'hello' })) instanceof TypeError);

  const parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('object: should parse object with 1 optional prop', (t) => {
  const schema = S.object({ optional: { title: S.string() } });

  t.true(t.throws(() => schema.parse({ title: 123 })) instanceof TypeError);

  let parsed = schema.parse({});
  t.deepEqual(parsed, {});

  parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });
});

test('object: should parse object with 1+ optional prop', (t) => {
  const schema = S.object({ optional: { title: S.string(), body: S.string() } });

  let parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });

  parsed = schema.parse({ body: 'hello' });
  t.deepEqual(parsed, { body: 'hello' });

  parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('object: should parse object with required and optional props', (t) => {
  const schema = S.object({
    required: { title: S.string() },
    optional: { body: S.string() },
  });

  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ body: 'hello' })) instanceof TypeError);

  let parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });

  parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('partial: should throw on non-object value', (t) => {
  const obj = S.object();
  const schema = S.partial(obj);
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('partial: should parse empty object', (t) => {
  const schema1 = S.partial(S.object());
  const parsed1 = schema1.parse({});
  t.deepEqual(parsed1, {});

  const schema2 = S.partial(S.object({ required: {} }));
  const parsed2 = schema2.parse({});
  t.deepEqual(parsed2, {});

  const schema3 = S.partial(S.object({ optional: {} }));
  const parsed3 = schema3.parse({});
  t.deepEqual(parsed3, {});

  const schema4 = S.partial(S.object({ required: {}, optional: {} }));
  const parsed4 = schema4.parse({});
  t.deepEqual(parsed4, {});
});

test('partial: should parse object with 1 required prop', (t) => {
  const schema = S.partial(S.object({ required: { title: S.string() } }));

  t.notThrows(() => schema.parse({}));
  t.true(t.throws(() => schema.parse({ title: 123 })) instanceof TypeError);

  const parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });
});

test('partial: should parse object with 1+ required prop', (t) => {
  const schema = S.partial(S.object({ required: { title: S.string(), body: S.string() } }));

  t.notThrows(() => schema.parse({}));
  t.notThrows(() => schema.parse({ title: '123' }));
  t.notThrows(() => schema.parse({ body: 'hello' }));

  const parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('partial: should parse object with 1 optional prop', (t) => {
  const schema = S.partial(S.object({ optional: { title: S.string() } }));

  t.true(t.throws(() => schema.parse({ title: 123 })) instanceof TypeError);

  let parsed = schema.parse({});
  t.deepEqual(parsed, {});

  parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });
});

test('partial: should parse object with 1+ optional prop', (t) => {
  const schema = S.partial(S.object({ optional: { title: S.string(), body: S.string() } }));

  let parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });

  parsed = schema.parse({ body: 'hello' });
  t.deepEqual(parsed, { body: 'hello' });

  parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('partial: should parse object with required and optional props', (t) => {
  const schema = S.partial(
    S.object({
      required: { title: S.string() },
      optional: { body: S.string() },
    }),
  );

  t.notThrows(() => schema.parse({}));
  t.notThrows(() => schema.parse({ body: 'hello' }));

  let parsed = schema.parse({ title: '123' });
  t.deepEqual(parsed, { title: '123' });

  parsed = schema.parse({ title: '123', body: 'hello' });
  t.deepEqual(parsed, { title: '123', body: 'hello' });
});

test('record: should throw on non-object value', (t) => {
  const schema = S.record();
  t.true(t.throws(() => schema.parse('123')) instanceof TypeError);
  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('record: should parse empty object', (t) => {
  const schema = S.record(S.string());
  const parsed = schema.parse({});
  t.deepEqual(parsed, {});
});

test('record: should throw on one invalid value', (t) => {
  const schema = S.record(S.object());
  t.true(t.throws(() => schema.parse({ value: '123' })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value: 123 })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value: true })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value: null })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value: undefined })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value: [] })) instanceof TypeError);
});

test('record: should throw on one invalid, one valid value', (t) => {
  const schema = S.record(S.object());
  t.true(t.throws(() => schema.parse({ value1: '123', value2: {} })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value1: {}, value2: 123 })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value1: true, value2: {} })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value1: {}, value2: null })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value1: undefined, value2: {} })) instanceof TypeError);
  t.true(t.throws(() => schema.parse({ value1: {}, value2: [] })) instanceof TypeError);
});

test('record: should parse single valid value', (t) => {
  const schema = S.record(S.string());
  const parsed = schema.parse({ value: 'abc' });
  t.deepEqual(parsed, { value: 'abc' });
});

test('record: should parse multiple valid values', (t) => {
  const schema = S.record(S.enum('abc', 'def'));
  const parsed = schema.parse({ value1: 'abc', value2: 'def' });
  t.deepEqual(parsed, { value1: 'abc', value2: 'def' });
});

test('string: should throw on non-string value', (t) => {
  const schema = S.string();
  t.true(t.throws(() => schema.parse(123)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(true)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(null)) instanceof TypeError);
  t.true(t.throws(() => schema.parse(undefined)) instanceof TypeError);
  t.true(t.throws(() => schema.parse({})) instanceof TypeError);
  t.true(t.throws(() => schema.parse([])) instanceof TypeError);
});

test('string: should parse string', (t) => {
  const schema = S.string();
  const parsed = schema.parse('hello');
  t.is(parsed, 'hello');
});

test('unknown: should pass any value', (t) => {
  const schema = S.unknown();
  t.is(schema.parse('123'), '123');
  t.is(schema.parse(123), 123);
  t.is(schema.parse(true), true);
  t.is(schema.parse(null), null);
  t.is(schema.parse(undefined), undefined);
  t.deepEqual(schema.parse([]), []);
  t.deepEqual(schema.parse({}), {});
});
