export type Infer<T extends SchemaType> = T['_type'];

export class Schema {
  static array<T extends SchemaType>(elementType: T): ArrayType<T> {
    return new ArrayType(elementType);
  }

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

  static partial<
    R extends Record<string, SchemaType> | undefined,
    O extends Record<string, SchemaType> | undefined,
    // eslint-disable-next-line @typescript-eslint/ban-types
  >(obj: ObjectType<R, O>): ObjectType<{}, NonEmpty<R> & NonEmpty<O>> {
    return new ObjectType({
      optional: { ...obj.params?.required, ...obj.params?.optional } as NonEmpty<R> & NonEmpty<O>,
    });
  }

  static record<T extends SchemaType>(valueSchema?: T): RecordType<T> {
    return new RecordType(valueSchema);
  }

  static string(): StringType {
    return new StringType();
  }

  static unknown(): UnknownType {
    return new UnknownType();
  }
}

export abstract class SchemaType<T = unknown> {
  /** We don't need any actual value set on this property, we use it solely for type tracking. */
  readonly _type!: T;
  abstract parse(obj: unknown): T;
}

class ArrayType<T extends SchemaType> extends SchemaType<Array<Infer<T>>> {
  constructor(private elementType: T) {
    super();
  }

  parse(obj: unknown): Array<Infer<T>> {
    if (!Array.isArray(obj)) {
      throw new TypeError('Expected an array');
    }
    obj.forEach((elem) => {
      this.elementType.parse(elem);
    });
    return obj as Array<Infer<T>>;
  }
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
  constructor(readonly params?: ObjectTypeParams<R, O>) {
    super();
  }

  parse(obj: unknown): InferObjectType<R, O> {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new TypeError('Expected an object');
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

class RecordType<T extends SchemaType> extends SchemaType<Record<string, Infer<T>>> {
  constructor(private readonly valueSchema = new UnknownType()) {
    super();
  }

  parse(obj: unknown): Record<string, Infer<T>> {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new TypeError('Expected an object');
    }
    Object.values(obj).forEach((value) => {
      this.valueSchema.parse(value);
    });
    return obj as Record<string, Infer<T>>;
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

class UnknownType extends SchemaType<unknown> {
  parse(obj: unknown): unknown {
    return obj;
  }
}

type Flatten<T> = T extends Record<string, unknown> ? { [K in keyof T]: T[K] } : T;

// eslint-disable-next-line @typescript-eslint/ban-types
type NonEmpty<T> = {} extends T ? {} : T;
