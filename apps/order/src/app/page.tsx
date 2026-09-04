import { Suspense } from 'react';
import { OrderPage } from './components/order-page/order-page';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OrderPage />
    </Suspense>
  );
}
