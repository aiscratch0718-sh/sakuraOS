import type { ReactNode } from "react";

/**
 * デザイン統一テーブルラッパー。`.data-table` クラスを使用。
 *
 * 使い方:
 *   <DataTable>
 *     <thead><tr><th>名前</th>...</tr></thead>
 *     <tbody>{rows.map(...)}</tbody>
 *   </DataTable>
 *
 * シンプルな用途では <DataTableBasic columns={...} rows={...} /> も利用可。
 */
export function DataTable({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="data-table">{children}</table>
    </div>
  );
}

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
};

/**
 * カラム定義から自動描画する簡易版。複雑な行表示は <DataTable> を直接使う。
 */
export function DataTableBasic<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "データがありません",
  rowKey = "id",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-[12px] text-ink-3">
        {emptyMessage}
      </div>
    );
  }
  return (
    <DataTable>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className={`text-${c.align ?? "left"} ${c.className ?? ""}`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const key = String(row[rowKey] ?? i);
          return (
            <tr key={key}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`text-${c.align ?? "left"} ${c.className ?? ""}`}
                >
                  {c.render
                    ? c.render(row)
                    : (row[c.key] as ReactNode | undefined) ?? "—"}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
