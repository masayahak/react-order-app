import { getProductByCode } from '@/actions/products';
import { notFound } from 'next/navigation';
import ProductForm from './ProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productCode = id;

  const product = await getProductByCode(productCode);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}
