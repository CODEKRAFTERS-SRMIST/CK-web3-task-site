import React from 'react';

export const FooterTelemetry: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#ff4799]/15 bg-[#090414]/90 backdrop-blur-md py-4 px-6 mt-auto z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-3 text-xs font-mono tracking-wider text-[#e2bdc7]/75">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CodeKrafters" className="w-5 h-5 object-contain" />
          <span className="font-semibold text-[#eadef8]">CODEKRAFTERS</span>
          <span className="text-[#a98891]">•</span>
          <span className="text-[#e2bdc7]">BUILD. LEARN. LEVEL UP.</span>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
              className="text-[#e2bdc7] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <img src="/assets/icons/github.svg" alt="GitHub" className="w-3.5 h-3.5 object-contain" />
              <span>GitHub</span>
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              title="Telegram"
              className="text-[#e2bdc7] hover:text-[#24A1DE] transition-colors flex items-center gap-1.5"
            >
              <img src="/assets/icons/telegram.svg" alt="Telegram" className="w-3.5 h-3.5 object-contain text-[#24A1DE]" />
              <span>Telegram</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-[#ffdb9d]">account_tree</span>
            <span className="text-[#eadef8]">Ethereum Mainnet / Sepolia</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#feb700]" />
            <span className="text-[#feb700] font-semibold">98.4k</span>
            <span className="text-[#a98891]">builders</span>
          </div>

          <div className="text-[#a98891]/80 text-[11px]">
            © 2025 CodeKrafters Guild Protocol. All nodes active.
          </div>
        </div>
      </div>
    </footer>
  );
};
