import React from 'react';

export const FooterTelemetry: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#ff4799]/15 bg-[#090414]/90 backdrop-blur-md py-4 px-6 mt-auto z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-3 text-xs font-mono tracking-wider text-[#e2bdc7]/75">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ff4799] animate-pulse" />
          <span className="font-semibold text-[#eadef8]">CODEKRAFTERS</span>
          <span className="text-[#a98891]">•</span>
          <span className="text-[#e2bdc7]">BUILD. LEARN. LEVEL UP.</span>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-[#ffdb9d]">account_tree</span>
            <span className="text-[#eadef8]">Ethereum Mainnet / Sepolia</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#feb700]" />
            <span className="text-[#feb700] font-semibold">98.4k</span>
            <span className="text-[#a98891]">builders</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#a98891]">Gas:</span>
            <span className="text-[#eadef8] font-semibold">14 Gwei</span>
          </div>

          <div className="text-[#a98891]/80 text-[11px]">
            © 2025 CodeKrafters Guild Protocol. All nodes active.
          </div>
        </div>
      </div>
    </footer>
  );
};
