import { getOrderById } from '@/actions/orders';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id);
  
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return <OrderForm order={order} />;
}
