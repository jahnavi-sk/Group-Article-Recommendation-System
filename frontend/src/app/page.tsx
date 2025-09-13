
'use client';

import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      router.push('/recommendation-type');
    }, 500); 
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent overflow-hidden">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isClicked ? 0 : 1, 
          y: isClicked ? -50 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center text-center space-y-6"
      >
        <h1 className="text-5xl md:text-7xl font-bold animate-text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] bg-clip-text text-transparent">
          RECAP 
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl px-4">
          Recommendation for Academic Authors and Papers. 
          <br/>
          Get personalized recommendations whether you're solo or with your crew.
        </p>
        <Button size="lg" className="group bg-card/50 backdrop-blur-sm" onClick={handleClick}>
          Get Started
          <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>
    </main>
  );
}
