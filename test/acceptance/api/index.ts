import { Schema as S, SchemaType } from '../../../src';

export default class Api {
  private builder = new Builder();
  private schema: SchemaType | null = null;

  setSchema(build: (builder: Builder) => SchemaType): void {
    this.schema = build(this.builder);
  }

  verifyPass(obj: unknown): void {
    if (!this.schema) {
      throw new Error('No schema');
    }
    this.schema.parse(obj);
  }

  verifyFail(obj: unknown): void {
    if (!this.schema) {
      throw new Error('No schema');
    }
    let failed = true;
    try {
      this.schema.parse(obj);
      failed = false;
    } catch (err) {
      if (!(err instanceof TypeError)) {
        throw err;
      }
    }
    if (!failed) {
      throw new Error('Failure expected');
    }
  }
}

class Builder {
  boolean() {
    return S.boolean();
  }

  enum(...vals: [string, ...string[]]) {
    return S.enum(...vals);
  }

  number() {
    return S.number();
  }

  object(props: { required: Record<string, SchemaType>; optional: Record<string, SchemaType> }) {
    return S.object(props);
  }

  string() {
    return S.string();
  }
}
