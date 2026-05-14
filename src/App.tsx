import React, { useState, useEffect, type FormEvent, type FC, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Terminal, Lock, ChevronRight, Hash, Shield, Database, Cpu, Globe } from 'lucide-react';

// --- Types ---
type Stage = 'ENTRY' | 'TRANSITION_1' | 'PUZZLE1' | 'TRANSITION_2' | 'PUZZLE2' | 'TRANSITION_3' | 'PUZZLE3' | 'TRANSITION_4' | 'REVELATION';

interface StageProps {
  onNext: () => void;
}

// --- Hooks & Utils ---

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, boundedX: 0, boundedY: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      const boundedX = (e.clientX / window.innerWidth - 0.5) * 2;
      const boundedY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x: e.clientX, y: e.clientY, boundedX, boundedY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

const ScrambleText: FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let iteration = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            if (letter === ' ') return ' ';
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 2;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

const MagneticButton: FC<{ children: React.ReactNode, type?: "button" | "submit", className?: string }> = ({ children, type = "button", className }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

// --- Components ---

const CustomCursor = () => {
  const { x, y } = useMousePosition();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.closest('button') !== null
      );
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (x === 0 && y === 0) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[100] hidden md:flex items-center justify-between font-display text-orange text-2xl drop-shadow-[0_0_8px_rgba(231,93,0,0.8)]"
      style={{ width: isHovering ? '48px' : '24px', height: '24px', marginLeft: isHovering ? '-24px' : '-12px', marginTop: '-12px' }}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
    >
      <span>[</span><span>]</span>
    </motion.div>
  );
};

const StageTransition: FC<{ text: string; onComplete: () => void }> = ({ text, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 text-center"
    >
      <motion.div
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.3, duration: 1.5 }}
         className="max-w-4xl space-y-4 md:space-y-8"
      >
        <div className="font-mono text-base md:text-xl text-blue font-bold tracking-widest text-left">{'>> SYSTEM_UPDATE'}</div>
        <p className="text-3xl md:text-6xl font-display text-ink uppercase text-reveal leading-none">{text}</p>
        <div className="font-mono text-orange animate-pulse text-left text-lg md:text-2xl mt-4 md:mt-8">LOADING_NEXT_MODULE...</div>
      </motion.div>
    </motion.div>
  );
};

const GrainOverlay = () => <div className="grain-overlay" />;
const Scanlines = () => <div className="scanlines" />;

// --- Stages ---

const StageEntry: FC<StageProps> = ({ onNext }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.toUpperCase() === 'COLLECTIVE') {
      onNext();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-full max-w-md space-y-12">
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotateY: [0, 180, 0] }}
            transition={{ duration: 1.5, rotateY: { duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 } }}
          >
            <Shield className="w-12 h-12 mx-auto text-ink/20 mb-6 drop-shadow-lg" />
          </motion.div>
          <h2 className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] opacity-40">Access Restricted</h2>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            <ScrambleText text="NOT EVERYONE WAS MEANT TO FIND THIS." />
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="relative group">
            <input
              type="password"
              autoFocus
              placeholder="ENTER_CREDENTIALS"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full bg-beige-light border-4 p-4 md:p-6 text-xl md:text-3xl font-mono text-center focus:outline-none transition-all shadow-[inset_4px_4px_0_rgba(20,20,20,0.1)] md:shadow-[inset_6px_6px_0_rgba(20,20,20,0.1)] ${
                error ? 'border-orange animate-shake text-orange shadow-[4px_4px_0px_#E75D00] md:shadow-[6px_6px_0px_#E75D00]' : 'border-ink focus:border-blue shadow-[4px_4px_0px_#141414] md:shadow-[6px_6px_0px_#141414] focus:shadow-[4px_4px_0px_#20668C] md:focus:shadow-[6px_6px_0px_#20668C]'
              }`}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 opacity-40 group-hover:opacity-100 transition-opacity text-lg md:text-xl font-display">
              _
            </div>
          </div>
          
          <MagneticButton 
            type="submit"
            className="group flex items-center justify-center gap-4 mx-auto px-8 py-5 md:px-12 md:py-6 w-full md:w-auto bg-ink text-beige font-display text-xl md:text-2xl tracking-[0.1em] border-4 border-transparent hover:bg-orange hover:text-ink hover:border-ink shadow-[6px_6px_0px_#20668C] md:shadow-[8px_8px_0px_#20668C] hover:shadow-[2px_2px_0px_#141414] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all"
          >
            <span>START_GAME</span>
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
          </MagneticButton>
        </form>

        <p className="font-mono text-xs opacity-50 mt-8 mb-4 text-center">
            You might wanna look at the domain?
        </p>

        <p className="font-mono text-[10px] opacity-30">
          "THE TRUTH IS HIDDEN IN PLAIN SIGHT."
        </p>
      </div>
    </motion.div>
  );
};

const StagePuzzle1: FC<StageProps> = ({ onNext }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.toUpperCase() === 'PATTERN') {
      onNext();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen py-10 md:py-20 px-6 container mx-auto max-w-5xl flex flex-col justify-center"
    >
      <div className="editorial-grid w-full items-center lg:gap-12">
        <div className="hidden lg:flex col-span-1 flex-col justify-center items-center opacity-20 font-mono text-sm">
          <span className="rotate-[-90deg] whitespace-nowrap tracking-widest mt-32">STAGE_01 // VISUAL_SEMANTICS</span>
        </div>
        
        <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          {[
            { id: "polka", bg: "radial-gradient(circle, var(--color-ink) 25%, transparent 26%), radial-gradient(circle, var(--color-ink) 25%, transparent 26%)", size: "30px 30px", pos: "0 0, 15px 15px" },
            { id: "stripes", bg: "repeating-linear-gradient(45deg, var(--color-ink), var(--color-ink) 8px, transparent 8px, transparent 16px)", size: "auto", pos: "0 0" },
            { id: "checker", bg: "conic-gradient(var(--color-ink) 25%, transparent 0 50%, var(--color-ink) 0 75%, transparent 0)", size: "30px 30px", pos: "0 0" },
            { id: "grid", bg: "linear-gradient(var(--color-ink) 2px, transparent 2px), linear-gradient(90deg, var(--color-ink) 2px, transparent 2px)", size: "16px 16px", pos: "-1px -1px" }
          ].map((pattern, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square bg-white brutalist-border overflow-hidden relative group max-w-[240px] mx-auto w-full"
            >
              <div 
                className="w-full h-full opacity-20 group-hover:opacity-60 transition-opacity duration-700" 
                style={{ 
                  backgroundImage: pattern.bg, 
                  backgroundSize: pattern.size, 
                  backgroundPosition: pattern.pos 
                }}
              />
              <div className="absolute bottom-1 right-1 font-mono text-[8px] opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white/80 px-1 py-0.5">
                P_{i}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-5 md:space-y-6 mt-8 lg:mt-0 text-center lg:text-left">
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-orange font-mono text-[10px] md:text-xs tracking-widest">PUZZLE_01</h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tighter">
              <ScrambleText text="COHESIVE SYMBOLISM." />
            </h3>
            <p className="text-ink/60 text-xs md:text-sm font-medium">Identify the singular link between these manifestations.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 max-w-sm mx-auto lg:mx-0">
            <div className="space-y-2 text-left">
              <label className="block font-display text-[10px] md:text-xs opacity-60 uppercase text-blue">Input Hypothesis_</label>
              <input
                type="text"
                autoFocus
                placeholder="IDENTIFY WORD..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`brutalist-input w-full uppercase !text-base md:!text-lg !p-2 md:!p-3 ${
                  error ? 'border-orange text-orange shadow-[4px_4px_0_#E75D00]' : 'shadow-[4px_4px_0_#141414] focus:shadow-[4px_4px_0_#20668C]'
                }`}
              />
            </div>
            <p className="text-[10px] md:text-xs font-mono text-ink/70 text-left">
              * Patterns speak louder than instructions.
            </p>
            <MagneticButton 
              type="submit"
              className="w-full py-3 md:py-4 bg-ink text-beige font-display text-base md:text-lg tracking-[0.1em] border-4 border-transparent hover:bg-blue hover:text-beige hover:border-ink shadow-[4px_4px_0px_#E75D00] md:shadow-[6px_6px_0px_#E75D00] hover:shadow-[2px_2px_0px_#141414] hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex justify-center items-center gap-3"
            >
              <span className="relative z-10">SUBMIT</span>
              <Terminal size={20} className="relative z-10" />
            </MagneticButton>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const StagePuzzle2: FC<StageProps> = ({ onNext }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  // Logos forming "MIND": McDonald's, Intel, Nike, Dell
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.toUpperCase() === 'MIND') {
      onNext();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen py-20 px-6 container mx-auto max-w-6xl"
    >
      <div className="max-w-3xl mx-auto space-y-8 md:space-y-16">
        <div className="text-center space-y-2 md:space-y-4">
          <h2 className="text-blue font-mono text-xs md:text-sm tracking-widest uppercase mb-2 md:mb-4">[ CLASSIFIED_DOCUMENT :: R_02 ]</h2>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
            <ScrambleText text="BLACKOUT RECOGNITION." />
          </h1>
          <p className="text-ink/60 font-mono text-[10px] md:text-xs uppercase tracking-widest leading-tight">Recognition is memory without permission.</p>
        </div>

        <div className="relative border-2 border-ink p-4 md:p-8 pt-10 md:pt-14 bg-beige-light shadow-[6px_6px_0px_#141414] md:shadow-[12px_12px_0px_#141414]">
          <div className="absolute top-0 left-0 w-full h-6 md:h-8 bg-ink flex items-center justify-between px-2 md:px-4">
            <span className="text-[8px] md:text-[10px] text-beige font-mono">FILE_NOMINAL_X4_99</span>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue animate-pulse" />
            </div>
          </div>
          
          <div className="pt-8 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'IDX_001', src: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg', hint: 'Golden Arches' },
                { label: 'IDX_002', src: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', hint: 'Eight Bars' },
                { label: 'IDX_003', src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', hint: 'The Swoosh' },
                { label: 'IDX_004', src: 'https://cdn.worldvectorlogo.com/logos/dell-2.svg', hint: 'The Tilted E' }
              ].map((item, i) => (
                <div key={i} className="space-y-4 text-center">
                  <div className="aspect-square bg-white brutalist-border flex items-center justify-center p-6 grayscale group relative cursor-help">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-ink/90 p-4 z-10">
                      <span className="text-[10px] font-mono leading-tight uppercase font-bold text-beige">{item.hint}</span>
                    </div>
                    <img 
                      src={item.src} 
                      alt="Brand Silhouette" 
                      className="max-w-full max-h-[60%] object-contain brightness-0" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-mono text-[10px] opacity-40">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-6 md:space-y-8 border-t-2 border-ink/10 pt-8 md:pt-12">
              <p className="text-xs md:text-sm font-medium">Extract the first character from each subject to synthesize the password.</p>
              
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:gap-6">
                <input
                  type="text"
                  autoFocus
                  placeholder="SYNTHESIZE_KEY_"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={`brutalist-input flex-1 uppercase !text-xl md:!text-2xl !p-3 md:!p-4 ${
                    error ? 'border-orange text-orange shadow-[4px_4px_0_#E75D00]' : 'shadow-[4px_4px_0_#141414] focus:shadow-[4px_4px_0_#E75D00]'
                  }`}
                />
                <MagneticButton 
                  type="submit"
                  className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 bg-ink text-beige font-display text-lg md:text-xl tracking-[0.1em] border-4 border-transparent hover:bg-orange hover:text-ink hover:border-ink shadow-[6px_6px_0px_#20668C] md:shadow-[8px_8px_0px_#20668C] hover:shadow-[2px_2px_0px_#141414] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all flex justify-center items-center gap-3"
                >
                  <span className="relative z-10">VALIDATE</span>
                </MagneticButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StagePuzzle3: FC<StageProps> = ({ onNext }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.toUpperCase() === 'INFLUENCE') {
      onNext();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto"
    >
      <div className="space-y-12 md:space-y-16 w-full">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 1.5 }}
           className="space-y-6 md:space-y-8"
        >
          <div className="w-24 md:w-32 h-2 bg-blue mx-auto mb-8 md:mb-12 border-2 border-ink shadow-[4px_4px_0_#E75D00] relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-white opacity-50"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>
          <p className="text-lg md:text-4xl font-mono leading-relaxed text-ink uppercase tracking-tight bg-beige-light p-4 md:p-8 border-4 border-ink shadow-[4px_4px_0_#141414] md:shadow-[8px_8px_0_#141414]">
            “I’m invisible, yet I move crowds.<br/>
            I’m stronger than volume and faster than facts.<br/>
            You’ll find me in trends, campaigns, and conversations—<br/>
            usually before people realize I’m there.”
          </p>
          <p className="text-3xl md:text-5xl font-bold tracking-tighter mt-8 md:mt-12">
            <ScrambleText text="What am I?" />
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8 md:space-y-12">
          <div className="relative group">
            <input
              type="text"
              autoFocus
              placeholder="YOUR_ANSWER_"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full bg-white border-4 border-ink py-4 md:py-8 text-2xl md:text-6xl font-display text-center focus:outline-none transition-all uppercase placeholder:opacity-20 shadow-[8px_8px_0_#20668C] md:shadow-[12px_12px_0_#20668C] focus:shadow-[4px_4px_0_#20668C] focus:translate-y-[4px] focus:translate-x-[4px] md:focus:translate-y-[8px] md:focus:translate-x-[8px] ${
                error ? 'border-orange text-orange shadow-[8px_8px_0_#E75D00] md:shadow-[12px_12px_0_#E75D00]' : 'text-ink'
              }`}
            />
          </div>
          
          <MagneticButton 
            type="submit"
            className="block w-full text-xl md:text-2xl bg-ink text-beige border-4 border-ink hover:bg-orange hover:text-ink py-4 md:py-6 font-display shadow-[6px_6px_0_#E75D00] md:shadow-[8px_8px_0_#E75D00] hover:shadow-[2px_2px_0_#E75D00] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all"
          >
            EXECUTE
          </MagneticButton>
        </form>
      </div>
    </motion.div>
  );
};

const StageRevelation = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-24 px-6 flex items-center justify-center dark-aura"
    >
      <div className="container max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-12 text-center space-y-12 mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-orange/60">Stage Final // The Revelation</span>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.85] text-ink text-center max-w-4xl mx-auto">
                <ScrambleText text="THE VEIL IS" /> <br/><span className="text-orange"><ScrambleText text="FINALLY" /></span> <ScrambleText text="LIFTED." />
              </h1>
              
              <div className="max-w-xl mx-auto pt-6 md:pt-8 border-t border-ink/5">
                <p className="text-lg md:text-xl font-medium tracking-tight text-ink/80 italic">
                  "You were studying how influence works. You just lived a demonstration of everything we study."
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-blue font-bold">[ MISSION_OVERVIEW ]</h3>
                <p className="text-base md:text-lg leading-relaxed text-ink/80 font-light">
                  The Collective is more than a name, it is a repository for human psychology and structural influence. What you perceived as puzzles were measurements of your cognitive elasticity. 
                </p>
                <div className="p-4 md:p-6 bg-beige-light border-4 border-ink shadow-[4px_4px_0_#20668C] md:shadow-[8px_8px_0_#20668C]">
                  <p className="text-xs md:text-sm font-mono leading-relaxed opacity-80 font-bold">
                    We study the spaces between thoughts—where decisions are made before they are spoken. You have successfully navigated the friction.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1 md:space-y-2">
                  <span className="block text-[8px] md:text-[10px] font-mono opacity-40 uppercase">Solvers Count</span>
                  <span className="text-xl md:text-3xl font-display text-ink">0.024%</span>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <span className="block text-[8px] md:text-[10px] font-mono opacity-40 uppercase">System Status</span>
                  <span className="text-xl md:text-3xl font-display text-orange drop-shadow-sm">SYNCHRONIZED</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-beige pt-8 p-6 md:p-10 border-4 border-ink shadow-[6px_6px_0_#20668C] md:shadow-[12px_12px_0_#20668C] relative z-10"
            >
             {!submitted ? (
                  <>
                      <iframe 
                        name="hidden_iframe" 
                        style={{ display: 'none' }} 
                      />
                  
                      <form
                        className="space-y-6 flex flex-col h-full"
                        action="https://docs.google.com/forms/d/e/1FAIpQLSfi5PkTF92oQmIXAt0SNVA7dwfhC90_z_cf0YccYEPFpScJVQ/formResponse"
                        method="POST"
                        target="hidden_iframe"
                        onSubmit={() => {

  setTimeout(() => {

    setSubmitted(true);

  }, 1200);

}}
                      >
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">RECRUITMENT</h2>
                    
                    <div className="p-4 md:p-5 bg-orange text-beige border-4 border-ink shadow-[4px_4px_0_#141414] md:shadow-[8px_8px_0_#141414] -rotate-1 relative z-20 group hover:-translate-y-1 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                      <div className="absolute top-0 right-0 p-2 md:p-3 opacity-50 text-white"><Lock size={16} /></div>
                      <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-3 font-mono flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        PRIZE CLAIM ACTIVATED
                      </h4>
                      <p className="text-xs md:text-sm font-medium opacity-95 leading-relaxed tracking-wide">
                        Successfully registered solvers are eligible to claim an exclusive reward in person on <span className="font-extrabold text-white underline underline-offset-4 decoration-2">MAY 26, 2026</span>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase opacity-50">Full Identity</label>
                      <input  type="text"
                              name="entry.964030483"
                              className="w-full brutalist-input !text-base md:!text-lg !p-2 md:!p-3"
                              placeholder="NAME"
                              required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase opacity-50">Division</label>
                        <input  type="text"
                                name="entry.208740380"
                                className="w-full brutalist-input !text-base md:!text-lg !p-2 md:!p-3"
                                placeholder="PROGRAM"
                                required />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] uppercase opacity-50">Level</label>
                        <input type="number"
                                name="entry.97953475"
                                className="w-full brutalist-input !text-base md:!text-lg !p-2 md:!p-3"
                                placeholder="YEAR"
                                required/>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] uppercase opacity-50">Contact String</label>
                      <input type="text"
                              name="entry.1735647804"
                              className="w-full brutalist-input !text-base md:!text-lg !p-2 md:!p-3"
                              placeholder="EMAIL / PHONE"
                              required/>
                    </div>
                  </div>

                  <MagneticButton 
                    type="submit"
                    className="w-full py-4 md:py-6 bg-blue text-beige border-4 border-ink font-display text-lg md:text-2xl tracking-[0.1em] shadow-[4px_4px_0_#E75D00] md:shadow-[8px_8px_0_#E75D00] hover:shadow-[2px_2px_0_#E75D00] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] hover:bg-orange hover:text-ink transition-all mt-4 md:mt-6 block group"
                  >
                    <span className="flex items-center justify-center gap-3">
                      JOIN_THE_COLLECTIVE
                      <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                  </MagneticButton>
                </form>
                </>
                ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-blue rounded-full mx-auto flex items-center justify-center text-beige">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">LOGGED.</h3>
                  <p className="font-mono text-[11px] opacity-60">STAY VIGILANT. <br/>MAY 26, 2026.</p>
                </div>
              )}
            </motion.div>
            
            {/* Dark aura element behind form */}
            <div className="absolute -inset-4 bg-ink/5 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- App ---

export default function App() {
  const [stage, setStage] = useState<Stage>('ENTRY');

  return (
    <div className="relative min-h-screen">
      <CustomCursor />
      <GrainOverlay />
      <Scanlines />

      <AnimatePresence mode="wait">
        {stage === 'ENTRY' && <StageEntry key="entry" onNext={() => setStage('TRANSITION_1')} />}
        {stage === 'TRANSITION_1' && <StageTransition key="t1" text="Identity confirmed. Welcome to The Collective." onComplete={() => setStage('PUZZLE1')} />}
        {stage === 'PUZZLE1' && <StagePuzzle1 key="p1" onNext={() => setStage('TRANSITION_2')} />}
        {stage === 'TRANSITION_2' && <StageTransition key="t2" text="You can see what is there. Now, see what is missing." onComplete={() => setStage('PUZZLE2')} />}
        {stage === 'PUZZLE2' && <StagePuzzle2 key="p2" onNext={() => setStage('TRANSITION_3')} />}
        {stage === 'TRANSITION_3' && <StageTransition key="t3" text="Recognition verified. But do you understand the mechanism?" onComplete={() => setStage('PUZZLE3')} />}
        {stage === 'PUZZLE3' && <StagePuzzle3 key="p3" onNext={() => setStage('TRANSITION_4')} />}
        {stage === 'TRANSITION_4' && <StageTransition key="t4" text="Influence acknowledged." onComplete={() => setStage('REVELATION')} />}
        {stage === 'REVELATION' && <StageRevelation key="rev" />}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
