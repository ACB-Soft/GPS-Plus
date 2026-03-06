import React from 'react';
import { FULL_BRAND } from '../version';

interface Props {
  showAd?: boolean;
}

const GlobalFooter: React.FC<Props> = ({ showAd = false }) => (
  <footer className="py-6 md:py-8 flex flex-col items-center mt-auto safe-bottom shrink-0 bg-transparent px-8">
    {/* Reklam Alanı */}
    {/* GoogleAd removed */}

    <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] text-center w-full">
      {FULL_BRAND}
    </p>
  </footer>
);

export default GlobalFooter;
