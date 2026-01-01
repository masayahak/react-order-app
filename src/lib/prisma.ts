import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンスを作成
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// データベース初期化用のヘルパー関数
export async function initializeDatabase() {
  const bcrypt = await import('bcryptjs');
  
  // ユーザーが存在するか確認
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    // 初期ユーザーを作成
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    await prisma.user.createMany({
      data: [
        {
          username: 'admin',
          password_hash: adminPasswordHash,
          role: 'Administrator',
        },
        {
          username: 'user',
          password_hash: userPasswordHash,
          role: 'User',
        },
      ],
    });

    console.log('初期ユーザーを作成しました');
  }

  // サンプルデータの作成（必要に応じて）
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        { customer_name: 'サンプル得意先A', phone_number: '03-1234-5678' },
        { customer_name: 'サンプル得意先B', phone_number: '06-9876-5432' },
        { customer_name: 'サンプル得意先C', phone_number: null },
      ],
    });
    console.log('サンプル得意先を作成しました');
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        { product_code: 'MA-08', product_name: 'ビグザム', unit_price: 8000000 },
        { product_code: 'MAN-03', product_name: 'ブラウ・ブロ', unit_price: 3200000 },
        { product_code: 'MAN-08', product_name: 'エルメス', unit_price: 3900000 },
        { product_code: 'MS-05B', product_name: 'ザクI', unit_price: 700000 },
        { product_code: 'MS-06', product_name: 'ザクII', unit_price: 820000 },
        { product_code: 'MS-07', product_name: 'グフ', unit_price: 950000 },
        { product_code: 'MS-09', product_name: 'ドム', unit_price: 1200000 },
        { product_code: 'MS-14', product_name: 'ゲルググ', unit_price: 1800000 },
        { product_code: 'MSM-03', product_name: 'ゴック', unit_price: 1180000 },
        { product_code: 'MSM-04', product_name: 'アッガイ', unit_price: 980000 },
        { product_code: 'MSM-07', product_name: 'ズゴック', unit_price: 1250000 },
        { product_code: 'MSM-10', product_name: 'ゾック', unit_price: 1480000 },
        { product_code: 'MSN-02', product_name: 'ジオング', unit_price: 4800000 },
        { product_code: 'RGM-79', product_name: 'ジム', unit_price: 1650000 },
        { product_code: 'RX-75-4', product_name: 'ガンタンク', unit_price: 500000 },
        { product_code: 'RX-77-2', product_name: 'ガンキャノン', unit_price: 1800000 },
        { product_code: 'RX-78-2', product_name: 'ガンダム', unit_price: 3000000 },
        { product_code: 'TEST-1', product_name: 'テスト１', unit_price: 999999999 },
        { product_code: 'TEST-2', product_name: 'テスト２', unit_price: 2000 },
        { product_code: 'TEST-3', product_name: 'テスト３', unit_price: 99999999 },
        { product_code: 'YMS-15', product_name: 'ギャン', unit_price: 2100000 },
      ],
    });
    console.log('サンプル商品を作成しました');
  }
}

