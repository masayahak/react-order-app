import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) {
    return db;
  }

  // サーバーサイドでのみ実行
  if (typeof window !== "undefined") {
    throw new Error("Database can only be accessed on the server side");
  }

  const dbPath = path.join(process.cwd(), "orderapp.db");

  // データベースファイルが存在しない場合は作成
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "");
  }

  db = new Database(dbPath, {
    readonly: false,
    fileMustExist: false,
  });
  return db;
}

// テーブル作成（初期化時に実行）
function initializeDatabase() {
  const database = getDb();
  database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    product_code TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    total_amount INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    amount INTEGER NOT NULL DEFAULT 0
  );
`);

  // 初期データの投入（既に存在する場合はスキップ）
  try {
    const userCount = database
      .prepare("SELECT COUNT(*) as count FROM users")
      .get() as { count: number };
    if (userCount.count === 0) {
      // デフォルトユーザー（パスワード: admin123）
      const adminPasswordHash = bcrypt.hashSync("admin123", 10);
      database
        .prepare(
          "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
        )
        .run("admin", adminPasswordHash, "Administrator");

      // 一般ユーザー（パスワード: user123）
      const userPasswordHash = bcrypt.hashSync("user123", 10);
      database
        .prepare(
          "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
        )
        .run("user", userPasswordHash, "User");

      // サンプル得意先
      const customers = [
        ["株式会社サンプル", "03-1234-5678"],
        ["テスト商事株式会社", "06-9876-5432"],
        ["デモ株式会社", "052-1111-2222"],
      ];
      const insertCustomer = database.prepare(
        "INSERT INTO customers (customer_name, phone_number) VALUES (?, ?)"
      );
      for (const [name, phone] of customers) {
        insertCustomer.run(name, phone);
      }

      // サンプル商品
      const products = [
        ["MA-08", "ビグザム", 8000000],
        ["MAN-03", "ブラウ・ブロ", 3200000],
        ["MAN-08", "エルメス", 3900000],
        ["MS-05B", "ザクI", 700000],
        ["MS-06", "ザクII", 820000],
        ["MS-07", "グフ", 950000],
        ["MS-09", "ドム", 1200000],
        ["MS-14", "ゲルググ", 1800000],
        ["MSM-03", "ゴック", 1180000],
        ["MSM-04", "アッガイ", 980000],
        ["MSM-07", "ズゴック", 1250000],
        ["MSM-10", "ゾック", 1480000],
        ["MSN-02", "ジオング", 4800000],
        ["RGM-79", "ジム", 1650000],
        ["RX-75-4", "ガンタンク", 500000],
        ["RX-77-2", "ガンキャノン", 1800000],
        ["RX-78-2", "ガンダム", 3000000],
        ["TEST-1", "テスト１", 999999999],
        ["TEST-2", "テスト２", 2000],
        ["TEST-3", "テスト３", 99999999],
        ["YMS-15", "ギャン", 2100000],
      ];
      const insertProduct = database.prepare(
        "INSERT INTO products (product_code, product_name, unit_price) VALUES (?, ?, ?)"
      );
      for (const [code, name, price] of products) {
        insertProduct.run(code, name, price);
      }
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

// サーバーサイドでのみ初期化を実行
if (typeof window === "undefined") {
  initializeDatabase();
}

export default getDb;
