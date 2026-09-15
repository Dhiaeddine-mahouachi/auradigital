export function d1(sqlite) {
  class BoundStatement {
    constructor(sql) {
      this.sql = sql;

      this.args = [];
    }

    bind(...args) {
      this.args = args.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value);
      return this;
    }

    async first() {
      return sqlite.prepare(this.sql).get(...this.args) || null;
    }

    async all() {
      return { results: sqlite.prepare(this.sql).all(...this.args) };
    }

    async run() {
      const result = sqlite.prepare(this.sql).run(...this.args);
      return {
        success: true,
        meta: {
          changes: Number(result.changes || 0),
          last_row_id: Number(result.lastInsertRowid || 0),
        },
      };
    }

    async batchResult() {
      if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(this.sql)) return this.all();
      return this.run();
    }
  }

  return {
    prepare(sql) { return new BoundStatement(sql); },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.batchResult());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
