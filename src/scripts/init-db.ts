import { prisma, initializeDatabase } from '../lib/prisma';

async function main() {
  console.log('データベースを初期化しています...');
  
  try {
    await initializeDatabase();
    console.log('データベースの初期化が完了しました');
  } catch (error) {
    console.error('初期化エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

