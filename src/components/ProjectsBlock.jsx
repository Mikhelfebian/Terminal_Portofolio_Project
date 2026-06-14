import { usePortfolio } from '../context/PortfolioContext';
import { StaggerList, StaggerItem } from './animations';

export function ProjectsBlock() {
  const { portfolioData } = usePortfolio();
  const projects = portfolioData?.projects || [];

  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {projects.map((p) => (
        <StaggerItem key={p.num}>
          <a href={p.url} target="_blank" rel="noreferrer"
            className="group border border-border p-3 hover:border-primary hover:bg-primary-glow/5 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer block relative overflow-hidden"
          >
            {p.photo && (
              <div className="w-full h-40 mb-3 overflow-hidden border border-border bg-surface-container-lowest">
                <img src={p.photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <span className="font-code-sm text-xs text-primary uppercase">[{p.num}]</span>
              <span className="material-symbols-outlined text-primary text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                open_in_new
              </span>
            </div>
            <h3 className="font-body text-sm font-bold text-on-surface group-hover:text-primary mb-2 transition-colors duration-300">
              {p.title}
            </h3>
            {p.description && (
              <p className="font-body-md text-body text-on-surface-variant mb-3 text-xs leading-relaxed">
                {p.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="font-code-sm text-caption border border-outline-variant px-1.5 py-0.5 text-on-surface-variant bg-surface-container-low group-hover:border-primary/30 transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>
          </a>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
