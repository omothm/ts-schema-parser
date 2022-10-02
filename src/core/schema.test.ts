import tap from 'tap';
import { throws } from '../../test/utils/tap';
import { Schema as S } from './schema';

void tap.test('array', async (t) => {
  await t.test('should throw on non-array value', (t2) => {
    const schema = S.array(S.string());

    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse({}), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    t2.end();
  });

  await t.test('should throw on heterogeneous array', (t2) => {
    const schema1 = S.array(S.string());
    throws(t2, () => schema1.parse([123]), TypeError);
    throws(t2, () => schema1.parse(['abc', 'def', 123]), TypeError);
    throws(t2, () => schema1.parse(['abc', 123, 'def']), TypeError);

    const schema2 = S.array(S.number());
    throws(t2, () => schema2.parse(['123']), TypeError);
    throws(t2, () => schema2.parse(['abc', 123]), TypeError);
    throws(t2, () => schema2.parse([123, 'def']), TypeError);

    const schema3 = S.array(S.object({ required: { code: S.string(), link: S.string() } }));
    throws(t2, () => schema3.parse([{ code: '123', link: 'abc' }, { code: '456' }]), TypeError);
    throws(
      t2,
      () =>
        schema3.parse([
          { code: '123', link: 'abc' },
          { code: '456', link: 123 },
        ]),
      TypeError,
    );

    t2.end();
  });

  await t.test('should parse empty array', (t2) => {
    const schema = S.array(S.string());
    const parsed = schema.parse([]);
    t2.strictSame(parsed, []);
    t2.end();
  });

  await t.test('should parse non-empty array', (t2) => {
    const schema1 = S.array(S.string());
    const parsed1 = schema1.parse(['abc', 'def', 'ghi']);
    t2.strictSame(parsed1, ['abc', 'def', 'ghi']);

    const schema2 = S.array(S.object({ required: { code: S.string(), link: S.string() } }));
    const parsed2 = schema2.parse([
      { code: '123', link: 'abc' },
      { code: '456', link: 'def' },
    ]);
    t2.strictSame(parsed2, [
      { code: '123', link: 'abc' },
      { code: '456', link: 'def' },
    ]);
    t2.end();
  });
});

void tap.test('boolean', async (t) => {
  const schema = S.boolean();

  await t.test('should throw on non-boolean value', (t2) => {
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse({}), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse boolean', (t2) => {
    const parsed = schema.parse(true);
    t2.equal(parsed, true);
    t2.end();
  });
});

void tap.test('enum', async (t) => {
  await t.test('should throw on non-enum values', (t2) => {
    const schema = S.enum('a', 'b', 'c');

    throws(t2, () => schema.parse('d'), TypeError);

    let parsed = schema.parse('a');
    t2.equal(parsed, 'a');
    parsed = schema.parse('b');
    t2.equal(parsed, 'b');
    parsed = schema.parse('c');
    t2.equal(parsed, 'c');

    t2.end();
  });
});

void tap.test('number', async (t) => {
  const schema = S.number();

  await t.test('should throw on non-number value', (t2) => {
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse({}), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse number', (t2) => {
    const parsed = schema.parse(123);
    t2.equal(parsed, 123);
    t2.end();
  });
});

void tap.test('object', async (t) => {
  await t.test('should throw on non-object value', (t2) => {
    const schema = S.object();
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse empty object', (t2) => {
    const schema1 = S.object();
    const parsed1 = schema1.parse({});
    t2.strictSame(parsed1, {});

    const schema2 = S.object({ required: {} });
    const parsed2 = schema2.parse({});
    t2.strictSame(parsed2, {});

    const schema3 = S.object({ optional: {} });
    const parsed3 = schema3.parse({});
    t2.strictSame(parsed3, {});

    const schema4 = S.object({ required: {}, optional: {} });
    const parsed4 = schema4.parse({});
    t2.strictSame(parsed4, {});

    t2.end();
  });

  await t.test('should parse object with required props', async (t2) => {
    await t2.test('should parse object with 1 required prop', (t3) => {
      const schema = S.object({ required: { title: S.string() } });

      throws(t3, () => schema.parse({}), TypeError);
      throws(t3, () => schema.parse({ title: 123 }), TypeError);

      const parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      t3.end();
    });

    await t2.test('should parse object with 1+ required prop', (t3) => {
      const schema = S.object({ required: { title: S.string(), body: S.string() } });

      throws(t3, () => schema.parse({}), TypeError);
      throws(t3, () => schema.parse({ title: '123' }), TypeError);
      throws(t3, () => schema.parse({ body: 'hello' }), TypeError);

      const parsed = schema.parse({ title: '123', body: 'hello' });
      t3.strictSame(parsed, { title: '123', body: 'hello' });

      t3.end();
    });
  });

  await t.test('should parse object with optional props', async (t2) => {
    await t2.test('should parse object with 1 optional prop', (t3) => {
      const schema = S.object({ optional: { title: S.string() } });

      throws(t3, () => schema.parse({ title: 123 }), TypeError);

      let parsed = schema.parse({});
      t3.strictSame(parsed, {});

      parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      t3.end();
    });

    await t2.test('should parse object with 1+ optional prop', (t3) => {
      const schema = S.object({ optional: { title: S.string(), body: S.string() } });

      let parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      parsed = schema.parse({ body: 'hello' });
      t3.strictSame(parsed, { body: 'hello' });

      parsed = schema.parse({ title: '123', body: 'hello' });
      t3.strictSame(parsed, { title: '123', body: 'hello' });

      t3.end();
    });
  });

  await t.test('should parse object with required and optional props', (t2) => {
    const schema = S.object({
      required: { title: S.string() },
      optional: { body: S.string() },
    });

    throws(t2, () => schema.parse({}), TypeError);
    throws(t2, () => schema.parse({ body: 'hello' }), TypeError);

    let parsed = schema.parse({ title: '123' });
    t2.strictSame(parsed, { title: '123' });

    parsed = schema.parse({ title: '123', body: 'hello' });
    t2.strictSame(parsed, { title: '123', body: 'hello' });

    t2.end();
  });
});

void tap.test('partial', async (t) => {
  await t.test('should throw on non-object value', (t2) => {
    const obj = S.object();
    const schema = S.partial(obj);
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse empty object', (t2) => {
    const schema1 = S.partial(S.object());
    const parsed1 = schema1.parse({});
    t2.strictSame(parsed1, {});

    const schema2 = S.partial(S.object({ required: {} }));
    const parsed2 = schema2.parse({});
    t2.strictSame(parsed2, {});

    const schema3 = S.partial(S.object({ optional: {} }));
    const parsed3 = schema3.parse({});
    t2.strictSame(parsed3, {});

    const schema4 = S.partial(S.object({ required: {}, optional: {} }));
    const parsed4 = schema4.parse({});
    t2.strictSame(parsed4, {});

    t2.end();
  });

  await t.test('should parse object with required props', async (t2) => {
    await t2.test('should parse object with 1 required prop', (t3) => {
      const schema = S.partial(S.object({ required: { title: S.string() } }));

      t3.doesNotThrow(() => schema.parse({}));
      throws(t3, () => schema.parse({ title: 123 }), TypeError);

      const parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      t3.end();
    });

    await t2.test('should parse object with 1+ required prop', (t3) => {
      const schema = S.partial(S.object({ required: { title: S.string(), body: S.string() } }));

      t3.doesNotThrow(() => schema.parse({}));
      t3.doesNotThrow(() => schema.parse({ title: '123' }));
      t3.doesNotThrow(() => schema.parse({ body: 'hello' }));

      const parsed = schema.parse({ title: '123', body: 'hello' });
      t3.strictSame(parsed, { title: '123', body: 'hello' });

      t3.end();
    });
  });

  await t.test('should parse object with optional props', async (t2) => {
    await t2.test('should parse object with 1 optional prop', (t3) => {
      const schema = S.partial(S.object({ optional: { title: S.string() } }));

      throws(t3, () => schema.parse({ title: 123 }), TypeError);

      let parsed = schema.parse({});
      t3.strictSame(parsed, {});

      parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      t3.end();
    });

    await t2.test('should parse object with 1+ optional prop', (t3) => {
      const schema = S.partial(S.object({ optional: { title: S.string(), body: S.string() } }));

      let parsed = schema.parse({ title: '123' });
      t3.strictSame(parsed, { title: '123' });

      parsed = schema.parse({ body: 'hello' });
      t3.strictSame(parsed, { body: 'hello' });

      parsed = schema.parse({ title: '123', body: 'hello' });
      t3.strictSame(parsed, { title: '123', body: 'hello' });

      t3.end();
    });
  });

  await t.test('should parse object with required and optional props', (t2) => {
    const schema = S.partial(
      S.object({
        required: { title: S.string() },
        optional: { body: S.string() },
      }),
    );

    t2.doesNotThrow(() => schema.parse({}));
    t2.doesNotThrow(() => schema.parse({ body: 'hello' }));

    let parsed = schema.parse({ title: '123' });
    t2.strictSame(parsed, { title: '123' });

    parsed = schema.parse({ title: '123', body: 'hello' });
    t2.strictSame(parsed, { title: '123', body: 'hello' });

    t2.end();
  });
});

void tap.test('record', async (t) => {
  await t.test('should throw on non-object value', (t2) => {
    const schema = S.record(S.string());
    throws(t2, () => schema.parse('123'), TypeError);
    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse empty object', (t2) => {
    const schema = S.record(S.string());
    const parsed = schema.parse({});
    t2.strictSame(parsed, {});
    t2.end();
  });

  await t.test('should throw on one invalid value', (t2) => {
    const schema = S.record(S.object());
    throws(t2, () => schema.parse({ value: '123' }), TypeError);
    throws(t2, () => schema.parse({ value: 123 }), TypeError);
    throws(t2, () => schema.parse({ value: true }), TypeError);
    throws(t2, () => schema.parse({ value: null }), TypeError);
    throws(t2, () => schema.parse({ value: undefined }), TypeError);
    throws(t2, () => schema.parse({ value: [] }), TypeError);
    t2.end();
  });

  await t.test('should throw on one invalid, one valid value', (t2) => {
    const schema = S.record(S.object());
    throws(t2, () => schema.parse({ value1: '123', value2: {} }), TypeError);
    throws(t2, () => schema.parse({ value1: {}, value2: 123 }), TypeError);
    throws(t2, () => schema.parse({ value1: true, value2: {} }), TypeError);
    throws(t2, () => schema.parse({ value1: {}, value2: null }), TypeError);
    throws(t2, () => schema.parse({ value1: undefined, value2: {} }), TypeError);
    throws(t2, () => schema.parse({ value1: {}, value2: [] }), TypeError);
    t2.end();
  });

  await t.test('should parse single valid value', (t2) => {
    const schema = S.record(S.string());
    const parsed = schema.parse({ value: 'abc' });
    t2.strictSame(parsed, { value: 'abc' });
    t2.end();
  });

  await t.test('should parse multiple valid values', (t2) => {
    const schema = S.record(S.enum('abc', 'def'));
    const parsed = schema.parse({ value1: 'abc', value2: 'def' });
    t2.strictSame(parsed, { value1: 'abc', value2: 'def' });
    t2.end();
  });
});

void tap.test('string', async (t) => {
  const schema = S.string();

  await t.test('should throw on non-string value', (t2) => {
    throws(t2, () => schema.parse(123), TypeError);
    throws(t2, () => schema.parse(true), TypeError);
    throws(t2, () => schema.parse(null), TypeError);
    throws(t2, () => schema.parse(undefined), TypeError);
    throws(t2, () => schema.parse({}), TypeError);
    throws(t2, () => schema.parse([]), TypeError);
    t2.end();
  });

  await t.test('should parse string', (t2) => {
    const parsed = schema.parse('hello');
    t2.equal(parsed, 'hello');
    t2.end();
  });
});
