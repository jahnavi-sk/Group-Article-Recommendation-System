
// 'use client';

// import { Button } from '@/components/ui/button';
// import { MoveRight } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { motion } from 'framer-motion';

// export default function Home() {
//   const router = useRouter();
//   const [isClicked, setIsClicked] = useState(false);
//   const [isLogin, setIsLogin] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);


//   const handleClick = () => {
//     setIsClicked(true);
//     setTimeout(() => {
//       router.push('/recommendation-type');
//     }, 500); 
//   };

//   const handleLoginClick = () => {
//     setIsLogin(true);
//     setTimeout(() => {
//       router.push('/recommendation-type');
//     }, 500); 
//   };

//   return (
//     <main className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent overflow-hidden">
//       <motion.div
//         initial={{ opacity: 1, y: 0 }}
//         animate={{ 
//           opacity: isClicked ? 0 : 1, 
//           y: isClicked ? -50 : 0,
//         }}
//         transition={{ duration: 0.4, ease: 'easeOut' }}
//         className="flex flex-col items-center justify-center text-center space-y-6"
//       >
//         <h1 className="text-5xl md:text-7xl font-bold animate-text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] bg-clip-text text-transparent">
//           RECAP 
//         </h1>
//         <p className="text-lg md:text-xl text-muted-foreground max-w-2xl px-4">
//           Recommendation for Academic Authors and Papers. 
//           <br/>
//           Get personalized recommendations whether you're solo or with your crew.
//         </p>
//         <Button size="lg" className="group bg-card/50 backdrop-blur-sm" onClick={handleClick}>
//           Get Started
//           <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//         </Button>
//         <Button size="lg" className="group bg-card/50 backdrop-blur-sm" onClick={handleClick}>
//           Login
//           <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//         </Button>
//         <Button size="lg" className="group bg-card/50 backdrop-blur-sm" onClick={handleClick}>
//           Sign up
//           <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//         </Button>
//       </motion.div>
//     </main>
//   );
// }


// 'use client';

// import { Button } from '@/components/ui/button';
// import { MoveRight } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { AuthDialog } from '@/components/auth/AuthDialog';

// export default function Home() {
//   const router = useRouter();
//   const [isClicked, setIsClicked] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogMode, setDialogMode] = useState<'login' | 'signup'>('login');

//   const handleClick = () => {
//     setIsClicked(true);
//     setTimeout(() => {
//       router.push('/recommendation-type');
//     }, 500); 
//   };

//   const handleAuthClick = (mode: 'login' | 'signup') => {
//     setDialogMode(mode);
//     setDialogOpen(true);
//   };

//   const handleSuccess = () => {
//     setDialogOpen(false);
//     router.push('/recommendation-type');
//   };

//   return (
//     <main className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent overflow-hidden">
//       <motion.div
//         initial={{ opacity: 1, y: 0 }}
//         animate={{ 
//           opacity: isClicked ? 0 : 1, 
//           y: isClicked ? -50 : 0,
//         }}
//         transition={{ duration: 0.4, ease: 'easeOut' }}
//         className="flex flex-col items-center justify-center text-center space-y-6"
//       >
//          <h1 className="text-5xl md:text-7xl font-bold animate-text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] bg-clip-text text-transparent">
//           RECAP 
//         </h1>
//         <p className="text-lg md:text-xl text-muted-foreground max-w-2xl px-4">
//           Recommendation for Academic Authors and Papers. 
//           <br/>
//           Get personalized recommendations whether you're solo or with your crew.
//         </p>
//         {/* <div className="flex flex-col sm:flex-row gap-4">
//           <Button size="lg" className="group bg-card/50 backdrop-blur-sm" onClick={handleClick}>
//             Get Started
//             <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//           </Button>
//         </div> */}
//          <div className="flex gap-4 mt-4">
//           <Button variant="outline" onClick={() => handleAuthClick('login')}>Log In</Button>
//           <Button variant="outline" onClick={() => handleAuthClick('signup')}>Sign Up</Button>
//         </div>
//       </motion.div>
//       <AuthDialog 
//         open={dialogOpen} 
//         onOpenChange={setDialogOpen} 
//         mode={dialogMode} 
//         onModeChange={setDialogMode}
//         onSuccess={handleSuccess}
//       />
//     </main>
//   );
// }





'use client';

import { Button } from '@/components/ui/button';
import { MoveRight, Github, Linkedin, Globe, Brain, Search, Users2, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { AuthDialog } from '@/components/auth/AuthDialog';

export default function Home() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'login' | 'signup'>('login');

  // --- INTERACTIVE PURPLE GLOW ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    router.push('/recommendation-type');
  };

  const team = [
    { 
      name: "Jahnavi S Kumar", 
      id: "PES2UG22CS230", 
      role: "Full Stack & Optimization",
      linkedin: "https://www.linkedin.com/in/jahnavi-s-kumar-7b5740306/",
      portfolio: "https://my-portfolio-website-pi-rust.vercel.app/",
      github: "https://github.com/jahnavi-sk"
    },
    { 
      name: "Theresa Clare Alex", 
      id: "PES2UG22CS627", 
      role: "Graph Data & Research",
      linkedin: "https://www.linkedin.com/in/theresa-alex/",
      portfolio: "#",
      github: "#"
    },
    { 
      name: "Janvii RV", 
      id: "PES2UG22CS232", 
      role: "ML & Interface Design",
      linkedin: "https://www.linkedin.com/in/janvii-rv-6775b824b/",
      portfolio: "https://janviirv-portfolio-2-0.vercel.app/",
      github: "https://github.com/JARVIS-28"
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      
      {/* PURPLE MOUSE GLOW */}
      <motion.div 
        style={{ left: springX, top: springY, translateX: '-50%', translateY: '-50%' }}
        className="pointer-events-none fixed z-0 h-[700px] w-[700px] rounded-full bg-primary/15 blur-[130px]"
      />

      {/* NAV SECTION */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 rounded-full border border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
        <span className="text-xs font-black tracking-widest text-primary uppercase">RECAP</span>
        <div className="h-4 w-[1px] bg-white/10" />
        
        <Button 
          variant="ghost" 
          className="text-[10px] uppercase tracking-widest rounded-full h-8 px-6 hover:bg-primary/20 hover:text-primary transition-all duration-300" 
          onClick={() => handleAuthClick('login')}
        >
          Log In
        </Button>

        <Button 
          variant="ghost" 
          className="text-[10px] uppercase tracking-widest rounded-full h-8 px-6 hover:bg-primary/20 hover:text-primary transition-all duration-300 border border-white/10 hover:border-primary/50" 
          onClick={() => handleAuthClick('signup')}
        >
          Sign Up
        </Button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-none">
            RE<span className="animate-text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] bg-clip-text text-transparent">CAP</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Finding relevant research shouldn't be a struggle. 
            Curated research papers and authors for <span className="text-primary font-medium italic">groups and individuals</span>.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl border-primary/50 text-primary hover:bg-primary/20 hover:border-primary transition-all duration-300" 
              onClick={() => handleAuthClick('signup')}
            >
              Get Started
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="gap-2 rounded-xl hover:bg-primary/20 hover:text-primary transition-all duration-300" 
              onClick={() => {
                document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* PROJECT OVERVIEW */}
      <section id="overview" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-10 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-md">
            <Search className="text-primary mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 italic">Personalized Curation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We tackle information overload by delivering research papers tailored specifically to individual interests.
            </p>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-card/30 border border-white/5 backdrop-blur-md">
            <Users2 className="text-primary mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 italic">Group Synergy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our system analyzes the diverse interests of each team member to provide balanced group-based recommendations.
            </p>
          </div>
          <div className="p-10 rounded-[2.5rem] bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Brain className="text-primary mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 italic text-primary">Intelligent Ranking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Using Knowledge Graphs and hybrid algorithms like Grey Wolf Optimization, we ensure high-quality, ranked results.
            </p>
          </div>
        </div>
      </section>

      {/* THE TEAM */}
      <section className="max-w-6xl mx-auto px-6 py-32 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-xs font-black tracking-[0.6em] uppercase text-primary mb-4 italic">
            Team 76
          </h2>
          <p className="text-muted-foreground">Guided by Dr. Sudeepa Roy Dey — PES University</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {team.map((member, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -12 }}
              className={`flex flex-col items-center text-center group ${i === 1 ? 'md:-translate-y-12' : 'md:translate-y-6'}`}
            >
              <div className="relative w-44 h-44 mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 p-1 bg-muted flex items-center justify-center">
                   <GraduationCap size={48} className="text-muted-foreground opacity-50 group-hover:text-primary transition-colors duration-300" />
                </div>
              </div>
              <h4 className="text-xl font-bold italic tracking-tight">{member.name}</h4>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary mt-2">{member.role}</p>
              
              <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  <Linkedin size={18} />
                </a>
                <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  <Globe size={18} />
                </a>
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                  <Github size={18} />
                </a>
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-4 opacity-50">{member.id}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-20 text-center opacity-30 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.8em]">Capstone Project Phase 3 // 2026</p>
      </footer>

      <AuthDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        mode={dialogMode} 
        onModeChange={setDialogMode}
        onSuccess={handleSuccess}
        className="rounded-[2.5rem] border-white/10 bg-card/90 backdrop-blur-xl shadow-2xl"
      />
    </main>
  );
}