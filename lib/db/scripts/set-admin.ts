import pg from "pg";

const sql = `
UPDATE "subscribers" SET "is_admin" = true WHERE "email" = 'yashvardhanjhala@gmail.com';
`;

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  console.log("Setting admin flag for yashvardhanjhala@gmail.com...");
  const res = await client.query(sql);
  console.log(`Update complete. Rows affected: ${res.rowCount}`);
  await client.end();
}

main().catch(console.error);
