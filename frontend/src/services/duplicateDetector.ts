import type { ParsedTransaction } from "./csvParser";

export function removeDuplicates(
  existing: ParsedTransaction[],
  incoming: ParsedTransaction[]
) {
  const existingKeys = new Set(
    existing.map(
      (t) =>
        `${t.date}-${t.description}-${t.amount}`
    )
  );

  const unique: ParsedTransaction[] = [];
  const duplicates: ParsedTransaction[] = [];

  incoming.forEach((transaction) => {
    const key = `${transaction.date}-${transaction.description}-${transaction.amount}`;

    if (existingKeys.has(key)) {
      duplicates.push(transaction);
    } else {
      unique.push(transaction);
    }
  });

  return {
    unique,
    duplicates,
  };
}