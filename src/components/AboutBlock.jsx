import { usePortfolio } from '../context/PortfolioContext';

export function AboutBlock() {
  const { portfolioData } = usePortfolio();
  
  return (
    <div className="p-3 border-l-2 border-primary bg-surface-container-lowest animate-fade-in">
      <p className="font-body-md text-body text-on-surface leading-relaxed">
        {portfolioData?.about}
      </p>
    </div>
  );
}
