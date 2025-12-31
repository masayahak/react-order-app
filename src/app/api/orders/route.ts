import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { orderRepository } from '@/lib/repositories/orderRepository';

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
    const result = orderRepository.getPaginated(page, pageSize, keyword);
    return NextResponse.json(result);
  }

  // 後方互換性のため、ページング指定がない場合は全件返す
  const orders = keyword
    ? orderRepository.search(keyword)
    : orderRepository.getAll();

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const order = orderRepository.create(
    {
      customer_id: body.customer_id,
      customer_name: body.customer_name,
      order_date: body.order_date,
      total_amount: body.total_amount || 0,
      created_by: parseInt(session.user.id),
    },
    body.details || []
  );

  return NextResponse.json(order);
}


