'use client';

import { AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/use-subscription';
import { useRouter } from 'next/navigation';

export default function PaymentPendingPage() {
  const { createPortalSession } = useSubscription();
  const router = useRouter();

  const handlePayNow = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      router.push('/pricing');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600">
            Pagamento Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Sua assinatura está com pagamento em atraso. Para continuar usando todos os recursos da plataforma, é necessário regularizar o pagamento.
          </p>
          <div className="space-y-2">
            <button
              onClick={handlePayNow}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Pagar Agora
            </button>
            <button
              onClick={() => router.push('/calendar')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Continuar com Acesso Limitado
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}