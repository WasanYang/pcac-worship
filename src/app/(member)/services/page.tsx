'use client';

import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Service } from '@/lib/placeholder-data';

export default function ServicesPage() {
  const { t } = useI18n();
  const firestore = useFirestore();
  const servicesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
            {t('services')}
          </h1>
          <p className='text-muted-foreground'>{t('servicesDesc')}</p>
        </div>
        <Button asChild>
          <Link href='/services/create'>
            <PlusCircle className='mr-2 h-4 w-4' /> {t('createService')}
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <div className='aspect-square w-full rounded-md bg-muted animate-pulse' />
              <div className='h-4 w-3/4 rounded-md bg-muted animate-pulse' />
              <div className='h-3 w-1/2 rounded-md bg-muted animate-pulse' />
            </div>
          ))}
        </div>
      )}

      {!isLoading && services && services.length === 0 && (
        <div className='flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg bg-muted/50'>
          <h3 className='text-lg font-semibold'>No Services Found</h3>
          <p className='text-sm text-muted-foreground'>
            Create a new service to get started.
          </p>
        </div>
      )}

      <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4'>
        {services?.map((service) => (
          <Link href={`/services/${service.id}`} key={service.id}>
            <Card className='flex flex-col bg-transparent shadow-none border-0 h-full group'>
              <div className='overflow-hidden rounded-md'>
                <Image
                  src={service.imageUrl}
                  alt={service.theme}
                  width={300}
                  height={300}
                  className='aspect-square w-full object-cover transition-transform group-hover:scale-105'
                  data-ai-hint='worship service'
                />
              </div>
              <CardHeader className='p-2 pt-4'>
                <CardTitle className='text-sm md:text-base truncate'>
                  {service.theme}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {service.date &&
                    new Date(service.date as Date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
