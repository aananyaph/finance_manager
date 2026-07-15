import Papa from "papaparse";
import { getCategory } from "./categoryEngine";

export type ParsedTransaction = {
  date: string;
  description: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
};

export function parseCSV(file: File) {
  return new Promise<ParsedTransaction[]>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (result) => {
        try {
          const parsed: ParsedTransaction[] = result.data.map(
            (row: any) => {
              // -----------------------------
              // Date
              // -----------------------------
              const date =
                row.Date ||
                row.date ||
                row["Transaction Date"] ||
                row["Txn Date"] ||
                row.ValueDate ||
                row["Value Date"] ||
                "";

              // -----------------------------
              // Description
              // -----------------------------
              const description =
                row.Description ||
                row.description ||
                row.Narration ||
                row.Remarks ||
                row.Particulars ||
                row.Details ||
                row["Transaction Details"] ||
                row["Transaction Description"] ||
                "";

              // -----------------------------
              // Amount and Type Detection
              // -----------------------------
              const cleanNumber = (val: any): number => {
                if (val === undefined || val === null) return 0;
                const str = String(val).replace(/[^0-9.-]/g, "");
                const num = Number(str);
                return isNaN(num) ? 0 : num;
              };

              const getRowVal = (keys: string[]) => {
                for (const key of keys) {
                  const foundKey = Object.keys(row).find(
                    (k) => k.toLowerCase().trim() === key.toLowerCase()
                  );
                  if (
                    foundKey &&
                    row[foundKey] !== undefined &&
                    row[foundKey] !== null &&
                    String(row[foundKey]).trim() !== ""
                  ) {
                    return row[foundKey];
                  }
                }
                return undefined;
              };

              const creditVal = getRowVal(["credit", "deposit", "cr", "received", "inflow"]);
              const debitVal = getRowVal(["debit", "withdrawal", "dr", "paid", "outflow", "payment"]);
              const amountVal = getRowVal(["amount", "value", "balance", "txn amount"]);
              const typeVal = String(
                getRowVal(["type", "transaction type", "txn type", "cr/dr", "dr/cr", "direction"]) || ""
              ).toLowerCase().trim();

              let amount = 0;
              let type: "Income" | "Expense" = "Expense";

              if (debitVal !== undefined && cleanNumber(debitVal) !== 0) {
                amount = Math.abs(cleanNumber(debitVal));
                type = "Expense";
              } else if (creditVal !== undefined && cleanNumber(creditVal) !== 0) {
                amount = Math.abs(cleanNumber(creditVal));
                type = "Income";
              } else if (amountVal !== undefined) {
                const cleanAmt = cleanNumber(amountVal);
                amount = Math.abs(cleanAmt);

                if (
                  typeVal.includes("debit") ||
                  typeVal.includes("dr") ||
                  typeVal.includes("withdrawal") ||
                  typeVal.includes("payment") ||
                  typeVal.includes("expense") ||
                  typeVal.includes("out")
                ) {
                  type = "Expense";
                } else if (
                  typeVal.includes("credit") ||
                  typeVal.includes("cr") ||
                  typeVal.includes("deposit") ||
                  typeVal.includes("income") ||
                  typeVal.includes("in")
                ) {
                  type = "Income";
                } else {
                  type = cleanAmt >= 0 ? "Income" : "Expense";
                }
              }


              //tempo
              console.log(row);
console.log({
  amount,
  type,
});
              return {
                date,
                description,
                amount,
                type,
                category:
                  getCategory(description),
              };
            }
          );

          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      },

      error(error) {
        reject(error);
      },
    });
  });
}