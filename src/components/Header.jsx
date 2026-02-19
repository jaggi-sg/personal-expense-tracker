import React from 'react';
import { Wallet } from 'lucide-react';

const Header = () => {
  return (
    <div className="rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-[1.01] transition-transform duration-300"
         style={{
           background: 'linear-gradient(100deg, rgba(2, 0, 36, 1) 0%, rgba(9, 86, 121, 1) 50%, rgba(1, 62, 102, 0.85) 75%, rgba(42, 3, 87, 1) 100%)',
           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 10px 20px -5px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
         }}>
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg transform hover:rotate-6 transition-transform duration-300">
          <Wallet className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide"
            style={{
              fontFamily: '"Orbitron", sans-serif'
            }}>
          EXPENSE TRACKER
        </h1>
      </div>
      <p className="text-white/90 text-center text-lg font-medium"
         style={{
           fontFamily: '"Montserrat", sans-serif',
           letterSpacing: '0.05em'
         }}>
        Track your recurring and non-recurring expenses with ease
      </p>
    </div>
  );
};

export default Header;