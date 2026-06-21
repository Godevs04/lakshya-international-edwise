import mongoose from "mongoose";

export type DbOp = { method: string; collection: string };

const NOISE_METHODS = new Set(["createIndex", "createIndexes", "ensureIndex"]);

export function createQueryCounter() {
  const ops: DbOp[] = [];

  mongoose.set("debug", (collection, method) => {
    ops.push({ collection, method });
  });

  return {
    ops,
    reset() {
      ops.length = 0;
    },
    queryOps() {
      return ops.filter((op) => !NOISE_METHODS.has(op.method));
    },
  };
}

export function countByCollectionMethod(
  slice: DbOp[],
  collection: string,
  method: string
): number {
  return slice.filter((op) => op.collection === collection && op.method === method).length;
}

export function countByMethod(slice: DbOp[], method: string): number {
  return slice.filter((op) => op.method === method).length;
}

export function summarizeOps(label: string, slice: DbOp[]) {
  const byMethod = slice.reduce<Record<string, number>>((acc, op) => {
    acc[op.method] = (acc[op.method] ?? 0) + 1;
    return acc;
  }, {});

  return {
    label,
    total: slice.length,
    studentAggregate: countByCollectionMethod(slice, "students", "aggregate"),
    studentCountDocuments: countByCollectionMethod(slice, "students", "countDocuments"),
    aggregate: countByMethod(slice, "aggregate"),
    countDocuments: countByMethod(slice, "countDocuments"),
    byMethod,
  };
}
