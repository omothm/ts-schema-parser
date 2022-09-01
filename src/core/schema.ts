export type Infer<T extends SchemaType> = T['_type'];

export class Schema {
  static boolean(): BooleanType {
    return new BooleanType();
  }

  static enum<T extends [string, ...string[]]>(...vals: T): EnumType<T> {
    return new EnumType(vals);
  }

  static number(): NumberType {
    return new NumberType();
  }

  static object<
    R extends Record<string, SchemaType> | undefined,
    O extends Record<string, SchemaType> | undefined,
  >(params?: ObjectTypeParams<R, O>): ObjectType<R, O> {
    return new ObjectType(params);
  }

  static string(): StringType {
    return new StringType();
  }
}

export abstract class SchemaType<T = unknown> {
  /** We don't need any actual value set on this property, we use it solely for type tracking. */
  readonly _type!: T;
  abstract parse(obj: unknown): T;
}

class BooleanType extends SchemaType<boolean> {
  parse(obj: unknown): boolean {
    if (typeof obj !== 'boolean') {
      throw new TypeError('Expected a boolean');
    }
    return obj;
  }
}

class EnumType<T extends [string, ...string[]]> extends SchemaType<T[number]> {
  private stringType = new StringType();

  constructor(private vals: T) {
    super();
  }

  parse(obj: unknown): T[number] {
    const s = this.stringType.parse(obj);
    if (!this.vals.includes(s)) {
      throw new TypeError('Value not in enum');
    }
    return s;
  }
}

class NumberType extends SchemaType<number> {
  parse(obj: unknown): number {
    if (typeof obj !== 'number') {
      throw new TypeError('Expected a number');
    }
    return obj;
  }
}

type InferObjectType<
  R extends Record<string, unknown> | undefined,
  O extends Record<string, unknown> | undefined,
> = Flatten<
  (undefined extends R
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      {}
    : {
        [K in keyof R]: R[K] extends SchemaType ? Infer<R[K]> : unknown;
      }) &
    (undefined extends O
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      : Partial<{
          [K in keyof O]: O[K] extends SchemaType ? Infer<O[K]> : unknown;
        }>)
>;

type ObjectTypeParams<
  R extends Record<string, SchemaType> | undefined,
  O extends Record<string, SchemaType> | undefined,
> = {
  required?: R;
  optional?: O;
};

class ObjectType<
  R extends Record<string, SchemaType> | undefined,
  O extends Record<string, SchemaType> | undefined,
> extends SchemaType<InferObjectType<R, O>> {
  constructor(private params?: ObjectTypeParams<R, O>) {
    super();
  }

  parse(obj: unknown): InferObjectType<R, O> {
    if (!(obj instanceof Object)) {
      throw new TypeError();
    }
    for (const [key, value] of Object.entries(
      this.params?.required ?? ({} as Record<string, SchemaType<unknown>>),
    )) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        throw TypeError(`Missing required property ${key}`);
      }
      value.parse((obj as Record<string, unknown>)[key]);
    }
    for (const [key, value] of Object.entries(
      this.params?.optional ?? ({} as Record<string, SchemaType<unknown>>),
    )) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }
      value.parse((obj as Record<string, unknown>)[key]);
    }
    return obj as InferObjectType<R, O>;
  }
}

class StringType extends SchemaType<string> {
  parse(obj: unknown): string {
    if (typeof obj !== 'string') {
      throw new TypeError();
    }
    return obj;
  }
}

type Flatten<T> = T extends Record<string, unknown> ? { [K in keyof T]: T[K] } : T;
