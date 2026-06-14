import { usePortfolio } from '../context/PortfolioContext';

export function SocialsBlock() {
  const { portfolioData } = usePortfolio();
  const socials = portfolioData?.socials || [];

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {socials.map((s) => (
        <a 
          key={s.abbr} 
          className="flex items-center space-x-2 px-3 py-2 border border-primary text-primary hover:bg-primary-glow/10 transition-all active:scale-95 cursor-pointer" 
          href={s.url} 
          target="_blank" 
          rel="noreferrer"
        >
          <span className="font-code-sm text-code-sm uppercase">[{s.abbr}]</span>
          <span className="font-body-md font-medium">{s.label}</span>
        </a>
      ))}
    </div>
  );
}
