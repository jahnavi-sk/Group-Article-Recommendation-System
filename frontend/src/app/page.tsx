
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
import { Github, Linkedin, Globe, Search, Users2, GraduationCap, MoveRight, Database, Cpu, Activity, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { AuthDialog } from '@/components/auth/AuthDialog';

export default function Home() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'login' | 'signup'>('login');

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

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
    setIsExiting(true);
    setTimeout(() => {
      router.push('/recommendation-type');
    }, 600);
  };

  const methodology = [
    {
      icon: <Database className="w-5 h-5" />,
      tag: "INFRASTRUCTURE",
      title: "Knowledge Graph Mapping",
      desc: "Utilizing Neo4j to map complex relationships between research works, authors, and academic institutions."
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      tag: "CORE ENGINE",
      title: "Hybrid Metaheuristic Search",
      desc: "A dual-stage optimization approach combining global exploration with precision local fine-tuning."
    },
    {
      icon: <Activity className="w-5 h-5" />,
      tag: "INTELLIGENCE",
      title: "Personalized Weighting",
      desc: "Analyzing diverse group interests to deliver high-relevance recommendations for both teams and individuals."
    }
  ];

  const team = [
    { name: "Jahnavi S Kumar", id: "PES2UG22CS230", role: "Full Stack & Optimization", linkedin: "https://www.linkedin.com/in/jahnavi-s-kumar-7b5740306/", portfolio: "https://my-portfolio-website-pi-rust.vercel.app/", github: "https://github.com/jahnavi-sk" },
    { name: "Theresa Alex", id: "PES2UG22CS627", role: "Graph Data & Research", linkedin: "https://www.linkedin.com/in/theresa-alex/", portfolio: "#", github: "#" },
    { name: "Janvii RV", id: "PES2UG22CS232", role: "ML & Interface Design", linkedin: "https://www.linkedin.com/in/janvii-rv-6775b824b/", portfolio: "https://janviirv-portfolio-2-0.vercel.app/", github: "https://github.com/JARVIS-28" }
  ];

  return (
    <main className="relative min-h-screen w-full bg-[#030303] text-foreground selection:bg-primary/30 overflow-x-hidden">
      
      {/* PURPLE MOUSE GLOW */}
      <motion.div 
        style={{ left: springX, top: springY, translateX: '-50%', translateY: '-50%' }}
        className="pointer-events-none fixed z-0 h-[800px] w-[800px] rounded-full bg-primary/10 blur-[140px]"
      />
      
      {/* SUBTLE BACKGROUND GRID */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* NAV */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center h-12 px-6 rounded-full border border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 group">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
          <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase group-hover:text-primary transition-colors">RECAP</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-6" />
        <div className="flex items-center gap-4">
          <button onClick={() => handleAuthClick('login')} className="text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors text-muted-foreground">Log In</button>
          <button 
            onClick={() => handleAuthClick('signup')}
            className="text-[10px] uppercase tracking-widest font-bold bg-primary/10 border border-primary/20 text-primary px-5 py-1.5 rounded-full hover:bg-primary/20 transition-all"
          >
            Launch
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -60, filter: 'blur(15px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* HERO SECTION */}
            <motion.section 
              style={{ opacity, scale }}
              className="relative h-screen flex flex-col items-center justify-center px-6 text-center z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-8 font-mono"
              >
                <Zap size={12} className="opacity-50" /> System Active
              </motion.div>
              
              <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.8] mb-8">
                RE<span className="animate-text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] bg-clip-text text-transparent">CAP</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                A specialized recommendation ecosystem for <br/>
                <span className="text-foreground italic">Academic Authors and Domain-Specific Research</span>.
              </p>
              
              <div className="flex gap-4 justify-center pt-12">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group rounded-xl px-10 border-white/5 bg-transparent transition-all hover:bg-primary/10 hover:border-primary/40 hover:text-primary" 
                  onClick={() => handleAuthClick('signup')}
                >
                  Get Started
                  <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.section>

            {/* ENGINE EXPLANATION */}
            <section className="max-w-7xl mx-auto px-6 py-40 relative z-10 border-y border-white/5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-xs font-black tracking-[0.5em] uppercase text-primary/60">Methodology</h2>
                    <h3 className="text-5xl font-bold tracking-tight italic">Optimized Graph Intelligence.</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg font-light">
                    Our platform tackles information overload by synthesizing the expertise of team members. Through <span className="text-foreground">metaheuristic optimization</span>, we resolve conflicting group interests to deliver precise, high-impact results.
                  </p>
                  <div className="flex gap-4 pt-4 font-mono">
                    <div className="px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-primary/40 mb-1 tracking-widest uppercase">Approach</p>
                      <p className="text-xl text-muted-foreground">Hybrid GWO</p>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] text-primary/40 mb-1 tracking-widest uppercase">Database</p>
                      <p className="text-xl text-muted-foreground italic">Neo4j</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {methodology.map((m, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 8 }}
                      className="p-8 rounded-2xl bg-[#080808] border border-white/5 flex gap-6 group hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="shrink-0 mt-1 text-primary/60 group-hover:text-primary transition-colors">{m.icon}</div>
                      <div>
                        <span className="text-[9px] font-mono text-white/10 tracking-[0.3em] uppercase">{m.tag}</span>
                        <h4 className="text-lg font-bold mt-1 mb-2 tracking-tight">{m.title}</h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">{m.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* TEAM SECTION */}
            <section className="max-w-7xl mx-auto px-6 py-40 relative z-10">
              <div className="text-center mb-20 space-y-2">
                <h2 className="text-[10px] font-black tracking-[0.8em] uppercase text-primary/60 italic">Architects</h2>
                <p className="text-muted-foreground text-sm font-light">Guided by Dr. Sudeepa Roy Dey — PES University</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {team.map((member, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="group bg-[#080808] border border-white/5 rounded-[2.5rem] p-12 text-center transition-all duration-500 hover:border-primary/30"
                  >
                    <div className="relative w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-10 bg-[#050505] transition-colors group-hover:border-primary/20">
                       <GraduationCap size={40} className="text-white/10 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold tracking-tight mb-2">{member.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold mb-8 italic">{member.role}</p>
                    
                    <div className="flex justify-center gap-6 text-muted-foreground mb-10">
                      <a href={member.linkedin} target="_blank" className="hover:text-primary transition-colors opacity-50 hover:opacity-100"><Linkedin size={20} /></a>
                      <a href={member.github} target="_blank" className="hover:text-primary transition-colors opacity-50 hover:opacity-100"><Github size={20} /></a>
                      <a href={member.portfolio} target="_blank" className="hover:text-primary transition-colors opacity-50 hover:opacity-100"><Globe size={20} /></a>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5">
                      <p className="text-[10px] font-mono text-white/5 uppercase tracking-widest">{member.id}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <footer className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
              <div className="w-8 h-[1px] bg-primary" />
              <p className="text-[9px] uppercase tracking-[1.5em] text-white">RECAP // 2026</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        mode={dialogMode} 
        onModeChange={setDialogMode}
        onSuccess={handleSuccess}
      />
    </main>
  );
}