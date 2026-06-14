import { useState, useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';

import { DataPage } from './components/DataPage';
import { SnakeGame } from './components/SnakeGame';
import { ProjectsBlock } from './components/ProjectsBlock';
import { AdminPage } from './components/AdminPage';
import { ChatFloating } from './components/ChatFloating';
import { ContactBlock } from './components/ContactBlock';
import ParticleBackground from './components/ParticleBackground';
import AuroraBackground from './components/AuroraBackground';

import { FadeIn, HoverCard, StaggerList, StaggerItem, AnimatedModal, SlideMenu } from './components/animations';

const NAV_ITEMS = ['home', 'about', 'skills', 'projects', 'contact'];

function MainPortfolioApp() {
  const { portfolioData } = usePortfolio();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    NAV_ITEMS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased min-h-screen overflow-x-hidden">

      <AuroraBackground />
      <ParticleBackground count={40} color="139, 92, 246" speed={0.25} />

      {/* ─── Sticky Nav ─── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-container-max mx-auto px-gutter h-14 flex items-center justify-between">
          <span className="font-code-sm text-sm font-bold text-primary tracking-wide">
            {portfolioData?.github_username?.toUpperCase() || 'PORTFOLIO'}
          </span>
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer
                  ${activeId === id
                    ? 'text-primary bg-accent-muted'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-hover'}
                `}
              >
                {id}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-primary rounded-lg hover:bg-surface-hover active:bg-surface-active transition-all duration-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-xl">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        <SlideMenu isOpen={mobileOpen}>
          <div className="md:hidden border-t border-border bg-surface px-gutter py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer
                  ${activeId === id ? 'text-primary bg-accent-muted font-medium' : 'text-on-surface-variant hover:text-primary'}
                `}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </SlideMenu>
      </nav>

      {/* ─── Admin Modal (Pattern 4: AnimatePresence) ─── */}
      <AnimatedModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} className="w-full max-w-[640px] h-[90vh]">
        <AdminPage onClose={() => setShowAdmin(false)} />
      </AnimatedModal>

      {/* ═══════════ HERO ═══════════ */}
      <section id="home" className="pt-28 pb-16 md:pb-20 px-gutter relative z-10">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <FadeIn direction="left" className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 bg-accent-muted border border-primary/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-caption font-code-sm font-semibold text-primary tracking-wider uppercase">System Online</span>
            </div>
            <h1 className="text-h2 md:text-h1 font-extrabold text-text-bright tracking-tight leading-tight">
              Hai, Saya{' '}
              <span className="text-primary">{portfolioData?.name || 'Nama Anda'}</span>
            </h1>
            <p className="font-code-display text-sm font-semibold text-primary">
              {portfolioData?.bio || 'Bio'}
            </p>
            <p className="text-body text-on-surface-variant leading-relaxed max-w-lg">
              {portfolioData?.hero_description || portfolioData?.about || ''}
            </p>
            <button
              onClick={() => scrollTo('projects')}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg
                hover:bg-primary-hover active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-primary
                transition-all duration-200 cursor-pointer"
            >
              Lihat Projek
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </FadeIn>
          <FadeIn direction="right" delay={0.15} className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface">
              {portfolioData?.hero_photo ? (
                <img
                  src={portfolioData.hero_photo}
                  alt="Hero"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-primary/30">image</span>
                  <span className="text-sm">Foto Portofolio</span>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="py-16 md:py-20 px-gutter relative z-10">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <FadeIn>
              <span className="inline-block text-caption text-primary font-code-sm font-semibold tracking-wider uppercase bg-accent-muted border border-primary/20 px-3 py-1 rounded-full">
                01. Tentang
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-h3 md:text-h2 font-extrabold text-text-bright tracking-tight">
                {portfolioData?.about_title || 'Tentang Saya'}
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="space-y-3 text-body text-on-surface-variant leading-relaxed">
                {(portfolioData?.about_text || portfolioData?.about || '')
                  .split('\n')
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn direction="right" delay={0.15}>
            <div className="relative max-w-[380px] mx-auto md:ml-auto">
              <div className="absolute -inset-2 border border-primary/20 rounded-xl translate-x-4 translate-y-4 -z-10" />
              <div className="aspect-square rounded-xl overflow-hidden border border-border bg-surface">
                <img
                  alt="About"
                  className="w-full h-full object-cover grayscale opacity-60 mix-blend-luminosity hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-105"
                  src={
                    portfolioData?.about_photo ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA--g7F-QoWB7ZPbMnNgcYpD2zYg0QfBSJNI7gcfZxo_kxhrKGiIT1ZRMPwkFhQg_J1X8xyflR_s1PV5KYLfjzj1pmSFJAHPHqw2Vl2Du_aQkGPJm0FYLM9xdvH7VYSyu03R4zy88Wwa6rJB0mwPXrPrUGh6PIRLc3NsOmtMkK_uTasn_4XY_WDq7JFZQRnG4LwAfVEJ_qg5yT6ZCW-I6OVdz2gLHMA25JK9h54PTmiAhN3oy1zvYGURaFjoRe-iUWb7uXLiZnLfi4w'
                  }
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ SKILLS (Pattern 3: Stagger + Pattern 2: HoverCard) ═══════════ */}
      <section id="skills" className="py-16 md:py-20 px-gutter relative z-10 bg-surface-container-low border-y border-border">
        <div className="max-w-container-max mx-auto text-center mb-10 space-y-3">
          <FadeIn>
            <span className="inline-block text-caption text-primary font-code-sm font-semibold tracking-wider uppercase bg-accent-muted border border-primary/20 px-3 py-1 rounded-full">
              02. Keahlian
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-h3 md:text-h2 font-extrabold text-text-bright tracking-tight">
              Tech Stack
            </h2>
          </FadeIn>
        </div>
        <StaggerList className="max-w-container-max mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(portfolioData?.skills || []).map((skill, i) => (
            <StaggerItem key={i}>
              <HoverCard className="group p-5 rounded-xl border border-border bg-surface
                hover:border-primary/40 hover:shadow-sm hover:shadow-primary/5
                active:scale-[0.99] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-2xl text-primary mb-3 block group-hover:scale-110 transition-transform duration-200">
                  {skill.icon || 'code'}
                </span>
                <h3 className="font-semibold text-sm text-text-bright mb-1.5 group-hover:text-primary transition-colors duration-200">
                  {skill.name}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{skill.desc}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {/* ═══════════ PROJECTS ═══════════ */}
      <section id="projects" className="py-16 md:py-20 px-gutter relative z-10">
        <div className="max-w-container-max mx-auto text-center space-y-3 mb-10">
          <FadeIn>
            <span className="inline-block text-caption text-primary font-code-sm font-semibold tracking-wider uppercase bg-accent-muted border border-primary/20 px-3 py-1 rounded-full">
              03. Projek
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-h3 md:text-h2 font-extrabold text-text-bright tracking-tight">
              Portofolio
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-body text-on-surface-variant max-w-xl mx-auto">
              Projek akademik dan eksplorasi teknologi.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="max-w-container-max mx-auto">
          <ProjectsBlock />
        </FadeIn>
      </section>

      {/* ═══════════ STATS & GAME ═══════════ */}
      <section id="stats-snake" className="py-16 md:py-20 px-gutter relative z-10 bg-surface-container-low border-y border-border">
        <div className="max-w-container-max mx-auto">
          <FadeIn className="text-center mb-10 space-y-3">
            <span className="inline-block text-caption text-primary font-code-sm font-semibold tracking-wider uppercase bg-accent-muted border border-primary/20 px-3 py-1 rounded-full">
              Stats & Game
            </span>
            <h2 className="text-h3 md:text-h2 font-extrabold text-text-bright tracking-tight">
              GitHub Stats &amp; Snake Game
            </h2>
          </FadeIn>
          <StaggerList className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaggerItem>
              <div className="bg-surface border border-border rounded-xl p-5">
                <DataPage />
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-surface border border-border rounded-xl p-5">
                <SnakeGame />
              </div>
            </StaggerItem>
          </StaggerList>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="py-16 md:py-20 px-gutter relative z-10">
        <div className="max-w-container-max mx-auto text-center space-y-3">
          <FadeIn>
            <span className="inline-block text-caption text-primary font-code-sm font-semibold tracking-wider uppercase bg-accent-muted border border-primary/20 px-3 py-1 rounded-full">
              04. Kontak
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-h3 md:text-h2 font-extrabold text-text-bright tracking-tight">
              Hubungi Saya
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-body text-on-surface-variant max-w-xl mx-auto">
              Kolaborasi, diskusi, atau sekadar menyapa.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.25} className="max-w-[480px] mx-auto pt-8">
          <ContactBlock onTriggerAdmin={() => setShowAdmin(true)} />
        </FadeIn>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 bg-surface-container-highest border-t border-border-strong">
        <div className="relative max-w-container-max mx-auto px-gutter py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <span className="inline-block font-code-sm text-sm font-bold text-primary tracking-widest uppercase">
                Mikhel Febian
              </span>
              <p className="text-caption text-on-surface-variant leading-relaxed max-w-xs">
                Mahasiswa Sistem Informasi — membangun solusi digital dengan kode dan kreativitas.
              </p>
              <div className="flex items-center gap-2 text-caption text-on-surface-variant/60">
                <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                Tersedia untuk kolaborasi
              </div>
            </div>

            {/* Navigasi */}
            <div className="space-y-4">
              <h4 className="font-code-sm text-xs font-bold text-on-surface-variant/50 tracking-widest uppercase">Navigasi</h4>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((id) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-left text-sm text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Sosial */}
            <div className="space-y-4">
              <h4 className="font-code-sm text-xs font-bold text-on-surface-variant/50 tracking-widest uppercase">Sosial</h4>
              <div className="flex items-center gap-3">
                {portfolioData?.socials?.map((s) => (
                  <a
                    key={s.abbr}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-on-surface-variant
                      hover:text-primary hover:border-primary/30 hover:bg-accent-muted active:scale-95
                      transition-all duration-200"
                    aria-label={s.label}
                  >
                    {s.abbr === 'ig' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    ) : s.abbr === 'gh' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold uppercase">{s.abbr}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-border/50 py-5">
          <div className="max-w-container-max mx-auto px-gutter flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-caption text-on-surface-variant/40">
              &copy; {new Date().getFullYear()} Mikhel Febian. All rights reserved.
            </span>
            <button
              onClick={() => scrollTo('home')}
              className="flex items-center gap-1.5 text-caption text-on-surface-variant/40 hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              Kembali ke atas
            </button>
          </div>
        </div>
      </footer>

      <ChatFloating />

    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <MainPortfolioApp />
    </PortfolioProvider>
  );
}
