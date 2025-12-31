import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productRepository } from '@/lib/repositories/productRepository';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  // ページングありの場合
  if (searchParams.has('page')) {
    const result = productRepository.getPaginated(page, pageSize, keyword);
    return NextResponse.json(result);
  }

  // 後方互換性のため、ページング指定がない場合は全件返す（サジェスト用）
  const products = keyword
    ? productRepository.search(keyword)
    : productRepository.getAll();

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const product = productRepository.create({
    product_name: body.product_name,
    unit_price: body.unit_price || 0,
  });

  return NextResponse.json(product);
}


