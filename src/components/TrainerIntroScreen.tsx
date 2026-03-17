import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Elite4Trainer } from '../types';

interface Props {
  trainer: Elite4Trainer;
  phase: 'intro' | 'outro';
  onContinue: () => void;
}

export default function TrainerIntroScreen({ trainer, phase, onContinue }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const fullText = phase === 'intro' ? trainer.intro : trainer.outro;

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [fullText]);

  const handleClick = () => {
    if (isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
    } else {
      onContinue();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      {/* Sprite allenatore */}
      <div className="flex-1 flex items-end justify-end p-8">
        <motion.img
          src={trainer.spriteUrl}
          alt={trainer.name}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/trainers/unknown.png'; }}
          className={`object-contain ${phase === 'outro' ? 'h-32 filter grayscale' : 'h-48 sm:h-64'}`}
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Box dialogo */}
      <div className="p-4">
        <div className="bg-slate-900 border border-white/10 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="text-amber-400 font-bold text-lg mb-2">{trainer.name}</div>
          <div className="text-white text-base leading-relaxed">
            {displayedText}
            {!isTyping && <span className="animate-bounce">▼</span>}
          </div>
        </div>
      </div>
    </div>
  );
}