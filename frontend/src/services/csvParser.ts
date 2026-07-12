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
              // Amount Detection
              // -----------------------------
              let amount = 0;
              let type: "Income" | "Expense" = "Expense";

              if (
                row.Amount !== undefined ||
                row.amount !== undefined
              ) {
                const value = Number(
                  row.Amount ?? row.amount
                );

                amount = Math.abs(value);

                type =
                  value >= 0
                    ? "Income"
                    : "Expense";
              } else if (
                row.Credit ||
                row.Deposit ||
                row.CR
              ) {
                amount = Number(
                  row.Credit ||
                    row.Deposit ||
                    row.CR
                );

                type = "Income";
              } else if (
                row.Debit ||
                row.Withdrawal ||
                row.DR
              ) {
                amount = Number(
                  row.Debit ||
                    row.Withdrawal ||
                    row.DR
                );

                type = "Expense";
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