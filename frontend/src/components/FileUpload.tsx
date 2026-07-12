import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
} from "lucide-react";
import categories from "../services/categories";
import api from "../services/api";

import {
  parseCSV,
  type ParsedTransaction,
} from "../services/csvParser";

import { removeDuplicates } from "../services/duplicateDetector";

import {
  cardStyles,
  buttonStyles,
  theme,
} from "../styles/theme";

function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [transactions, setTransactions] =
    useState<ParsedTransaction[]>([]);

  const [duplicates, setDuplicates] =
    useState<ParsedTransaction[]>([]);

  const [uniqueTransactions, setUniqueTransactions] =
    useState<ParsedTransaction[]>([]);

  const [dragging, setDragging] =
    useState(false);

  const handleFile = async (
    selected: File | null
  ) => {
    if (!selected) return;

    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowed.includes(selected.type)) {
      alert(
        "Only CSV and Excel files are supported."
      );
      return;
    }

    setFile(selected);

    const parsed =
      await parseCSV(selected);

    // Later replaced with MongoDB data
    const existingTransactions:
      ParsedTransaction[] = [];

    const result =
      removeDuplicates(
        existingTransactions,
        parsed
      );

    setTransactions(result.unique);
    setUniqueTransactions(result.unique);
    setDuplicates(result.duplicates);
  };

  return (
    <div
      style={{
        ...cardStyles.paddedCard,
      }}
    >
      <p style={labelStyle}>UPLOAD</p>

      <h2 style={titleStyle}>
        Import Statement
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {
          e.preventDefault();

          setDragging(false);

          handleFile(
            e.dataTransfer.files[0]
          );
        }}
        onClick={() =>
          inputRef.current?.click()
        }
        style={{
          ...dropArea,
          borderColor: dragging
            ? theme.colors.primary
            : theme.colors.border,

          background: dragging
            ? "#eff6ff"
            : "#fafcff",
        }}
      >
        <UploadCloud
          size={60}
          color={theme.colors.primary}
        />

        <h3>
          Drag & Drop your statement
        </h3>

        <p style={muted}>
          CSV • XLSX • Excel
        </p>

        <button
          type="button"
          style={{
            ...buttonStyles.primary,
            marginTop: "16px",
          }}
        >
          Browse Files
        </button>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".csv,.xlsx,.xls"
          onChange={(e) =>
            handleFile(
              e.target.files
                ? e.target.files[0]
                : null
            )
          }
        />
      </div>

      {file && (
        <div style={successBox}>
          <CheckCircle2
            color={
              theme.colors.success
            }
            size={22}
          />

          <div>
            <strong>
              {file.name}
            </strong>

            <p style={muted}>
              {(
                file.size / 1024
              ).toFixed(2)}{" "}
              KB
            </p>
          </div>
        </div>
      )}

      {file && (
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "18px",
              borderRadius: "14px",
              background:
                "#dcfce7",
            }}
          >
            <h2>
              {
                uniqueTransactions.length
              }
            </h2>

            <p>
              New Transactions
            </p>
          </div>

          <div
            style={{
              flex: 1,
              padding: "18px",
              borderRadius: "14px",
              background:
                "#fee2e2",
            }}
          >
            <h2>
              {duplicates.length}
            </h2>

            <p>Duplicates</p>
          </div>
        </div>
      )}

      {transactions.length >
        0 && (
        <div
          style={{
            marginTop: 20,
            overflowX: "auto",
          }}
        >
          <h3>
            Parsed Transactions (
            {
              transactions.length
            }
            )
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th style={headerCell}>
                  Date
                </th>

                <th style={headerCell}>
                  Description
                </th>

                <th style={headerCell}>
                  Amount
                </th>

                <th style={headerCell}>
                  Type
                </th>

                <th style={headerCell}>
                  Category
                </th>
                <th style={headerCell}>
                    Action
                    </th>
              </tr>
            </thead>

            <tbody>
  {transactions.slice(0, 10).map((t, i) => (
    <tr key={i}>
      <td style={cell}>{t.date}</td>

      <td style={cell}>{t.description}</td>

      <td style={cell}>
        ₹{t.amount.toLocaleString("en-IN")}
      </td>

      <td style={cell}>
        <span
          style={{
            color:
              t.type === "Income"
                ? "#16a34a"
                : "#dc2626",
            fontWeight: 600,
          }}
        >
          {t.type}
        </span>
      </td>

      <td style={cell}>
        <select
          value={t.category}
          onChange={(e) => {
            const updated = [...transactions];
            updated[i].category = e.target.value;
            setTransactions(updated);
          }}
          style={{
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>
      </td>

      <td style={cell}>
        <button
          onClick={() => {
            setTransactions(
              transactions.filter(
                (_, index) => index !== i
              )
            );
          }}
          style={{
            border: "none",
            background: "#fee2e2",
            color: "#dc2626",
            padding: "6px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
<div
  style={{
    marginTop: "20px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "flex-end",
  }}
>
  <button
    style={{
      ...buttonStyles.primary,
      padding: "12px 24px",
    }}
   onClick={async () => {
  try {
    const res = await api.post(
      "/transactions/import",
      transactions
    );

    alert(
      `✅ Imported ${res.data.count} transactions successfully!`
    );

    setTransactions([]);
    setFile(null);
    setDuplicates([]);
    setUniqueTransactions([]);
  } catch (err) {
    alert("Import failed.");
    console.error(err);
  }
}}
  >
    Import All
  </button>
</div>
          <p
            style={{
              marginTop: "14px",
              color:
                theme.colors.textMuted,
              fontSize: "13px",
            }}
          >
            Showing first 10
            transactions...
          </p>
        </div>
      )}

      <div style={infoBox}>
        <FileText
          size={18}
          color={theme.colors.primary}
        />

        <div>
          <strong>
            Upcoming Modules
          </strong>

          <p style={muted}>
            Duplicate Detection •
            Editable Preview • Bulk
            Import • AI
            Categorization
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  color: theme.colors.primary,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const titleStyle = {
  marginTop: "8px",
  marginBottom: "22px",
};

const dropArea = {
  border: "2px dashed",
  borderRadius: "18px",
  padding: "40px",
  textAlign: "center" as const,
  cursor: "pointer",
  transition: "all .25s",
};

const successBox = {
  marginTop: "20px",
  padding: "16px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "#ecfdf5",
};

const infoBox = {
  marginTop: "24px",
  padding: "18px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "#eff6ff",
};

const headerCell = {
  textAlign: "left" as const,
  padding: "12px",
  background: "#f8fafc",
  borderBottom:
    "2px solid #e2e8f0",
  fontWeight: 700,
};

const cell = {
  padding: "12px",
  borderBottom:
    "1px solid #f1f5f9",
  fontSize: "14px",
};

const muted = {
  color: theme.colors.textMuted,
  marginTop: "4px",
};

export default FileUpload;