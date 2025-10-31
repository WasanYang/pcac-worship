
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

const backgroundImageUrl = placeholderImages.find(p => p.id === 'homeBanner')?.imageUrl || '/placeholder.jpg';

export default function LoginPage() {
  const [view, setView] = useState<View>('initial');

  const handleBack = () => setView('initial');

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground'>
       {view !== 'initial' && (
           <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack} 
                className="absolute top-4 left-4 z-20"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
        )}

        <AnimatePresence mode="wait">
          {view === 'initial' && (
            <motion.div
              key='initial'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className='flex h-screen w-full flex-col'
            >
                {/* Top Half (50%) */}
                <div className='relative h-1/2 flex flex-col items-center justify-center text-white'>
                     <Image
                        src={backgroundImageUrl}
                        alt='Worship'
                        fill
                        className='object-cover'
                        data-ai-hint='worship band'
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-background to-transparent"></div>
                    <div className='z-10 text-center p-4'>
                        <Music className='h-16 w-16 mx-auto mb-4' />
                        <h1 className='text-4xl md:text-5xl font-bold'>Worship Flow</h1>
                        <p className='mt-2 text-lg text-white/90'>Streamline your worship team management.</p>
                    </div>
                </div>

                {/* Bottom Half (50%) */}
                <div className='h-1/2 flex flex-col justify-center items-center py-8 px-4 w-full'>
                    <div className="w-full max-w-sm flex flex-col gap-4">
                         <Button 
                            size='lg' 
                            onClick={() => setView('signIn')} 
                            className="w-full bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-lg py-6 font-normal"
                        >
                        Login
                        </Button>
                        <Button 
                            size='lg' 
                            variant='outline' 
                            onClick={() => setView('signUp')}
                            className="w-full bg-background text-foreground border-2 border-foreground/50 hover:bg-accent hover:text-accent-foreground dark:border-white/50 text-lg py-6 font-normal"
                        >
                        Register
                        </Button>
                    </div>
              </div>
            </motion.div>
          )}

          {(view === 'signIn' || view === 'signUp') && (
             <motion.div
              key={view}
              variants={formVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='relative z-10 flex h-screen w-full items-center justify-center p-4 text-center bg-background'
            >
              {view === 'signIn' ? <SignInForm onGoToRegister={() => setView('signUp')} /> : <SignUpForm />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
