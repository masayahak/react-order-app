import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) {
    return db;
  }

  // サーバーサイドでのみ実行
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be accessed on the server side');
  }

  const dbPath = path.join(process.cwd(), 'orderapp.db');

  // データベースファイルが存在しない場合は作成
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  db = new Database(dbPath);
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
  );

  CREATE TABLE IF NOT EXISTS order_details (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    amount INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
  );
`);

  // 初期データの投入（既に存在する場合はスキップ）
  try {
    const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      const bcrypt = require('bcryptjs');
      
      // デフォルトユーザー（パスワード: admin123）
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      database.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', adminPasswordHash, 'Administrator');
      
      // 一般ユーザー（パスワード: user123）
      const userPasswordHash = bcrypt.hashSync('user123', 10);
      database.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('user', userPasswordHash, 'User');

      // サンプル得意先
      const customers = [
        ['株式会社サンプル', '03-1234-5678'],
        ['テスト商事株式会社', '06-9876-5432'],
        ['デモ株式会社', '052-1111-2222'],
      ];
      const insertCustomer = database.prepare('INSERT INTO customers (customer_name, phone_number) VALUES (?, ?)');
      for (const [name, phone] of customers) {
        insertCustomer.run(name, phone);
      }

      // サンプル商品
      const products = [
        ['商品A', 1000],
        ['商品B', 2000],
        ['商品C', 3000],
        ['商品D', 1500],
        ['商品E', 2500],
      ];
      const insertProduct = database.prepare('INSERT INTO products (product_name, unit_price) VALUES (?, ?)');
      for (const [name, price] of products) {
        insertProduct.run(name, price);
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// サーバーサイドでのみ初期化を実行
if (typeof window === 'undefined') {
  initializeDatabase();
}

export default getDb;

