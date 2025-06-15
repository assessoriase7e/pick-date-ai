'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionButtonProps {
  priceId: string;
  planName: string;
  className?: string;
}

export function SubscriptionButton({ priceId, planName, className }: SubscriptionButtonProps) {
  const { createSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await createSubscription(priceId);
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        `Assinar ${planName}`
      )}
    </Button>
  );
}