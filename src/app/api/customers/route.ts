import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { customerRepository } from '@/lib/repositories/customerRepository';

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
    const result = customerRepository.getPaginated(page, pageSize, keyword);
    return NextResponse.json(result);
  }

  // 後方互換性のため、ページング指定がない場合は全件返す（サジェスト用）
  const customers = keyword
    ? customerRepository.search(keyword)
    : customerRepository.getAll();

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const customer = customerRepository.create({
    customer_name: body.customer_name,
    phone_number: body.phone_number || null,
  });

  return NextResponse.json(customer);
}


