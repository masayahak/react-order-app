import { getCustomerById } from '@/actions/customers';
import { notFound } from 'next/navigation';
import CustomerForm from './CustomerForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customerId = parseInt(id);
  
  if (isNaN(customerId)) {
    notFound();
  }

  const customer = await getCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  return <CustomerForm customer={customer} />;
}
