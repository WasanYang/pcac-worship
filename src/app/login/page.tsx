
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Music, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInForm } from './_components/SignInForm';
import { SignUpForm } from './_components/SignUpForm';

type View = 'initial' | 'signIn' | 'signUp';

const backgroundImageUrl = placeholderImages.find(p => p.id === 'service2')?.imageUrl || '/placeholder.jpg';

export default function LoginPage() {
  const [view, setView] = useState<View>('initial');

  const handleBack = () => setView('initial');

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background'>
      <Image
        src={backgroundImageUrl}
        alt='Worship service'
        fill
        className='object-cover'
        data-ai-hint='worship service'
      />
      <div className='absolute inset-0 bg-black/60' />
      <div className='relative z-10 flex w-full max-w-md flex-col items-center p-4 text-center text-white'>
        
        {view !== 'initial' && (
           <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack} 
                className="absolute top-4 left-4 text-white hover:bg-white/10 hover:text-white"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        )}

        <AnimatePresence mode="wait">
          {view === 'initial' && (
            <motion.div
              key='initial'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className='flex w-full flex-col items-center'
            >
              <Music className='h-16 w-16 mb-4' />
              <h1 className='text-4xl md:text-5xl font-bold'>Worship Flow</h1>
              <p className='mt-2 text-lg text-white/80'>Streamline your worship team management.</p>
              <div className='mt-10 flex w-full flex-col gap-4'>
                <Button 
                  size='lg' 
                  onClick={() => setView('signIn')} 
                  className="bg-primary/80 hover:bg-primary text-primary-foreground text-lg py-6"
                >
                  Sign In
                </Button>
                <Button 
                  size='lg' 
                  variant='outline' 
                  onClick={() => setView('signUp')}
                  className="bg-transparent border-white/80 hover:bg-white/10 text-white text-lg py-6"
                >
                  Sign Up
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'signIn' && (
            <motion.div
              key='signIn'
              variants={formVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='w-full'
            >
              <SignInForm />
            </motion.div>
          )}

          {view === 'signUp' && (
            <motion.div
              key='signUp'
              variants={formVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='w-full'
            >
              <SignUpForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
