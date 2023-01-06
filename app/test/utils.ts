import type { Database } from "better-sqlite3";

const findTablesSql = /*sql*/ `
SELECT 
    name
FROM 
    sqlite_schema
WHERE 
    type ='table' AND 
    name NOT LIKE 'sqlite_%';
`;

const emptyTableSql = (tableName: string) =>
  /*sql*/ `DELETE FROM ${tableName};`;

export function cleanAllTables(database: Database): void {
  console.debug("clean all tables...");
  if (process.env.NODE_ENV === "production") {
    throw new Error("won't clean tables in production");
  }
  const findAllTables = database.prepare(findTablesSql);
  const tables = findAllTables.all();
  const emptyTablesSql = tables
    .map((table) => emptyTableSql(table.name))
    .join("\n");
  database.exec("PRAGMA foreign_keys=off");
  try {
    database.exec(emptyTablesSql);
    console.debug("clean all tables... done");
  } finally {
    database.exec("PRAGMA foreign_keys=on");
  }
}
