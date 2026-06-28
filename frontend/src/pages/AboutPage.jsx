import React from 'react'

const workflowSteps = [
  'Search Company',
  'Collect Financial Data',
  'Analyze the Data',
  'Generate Report',
  'Download & Share',
  'Continue Investing',
]

const aboutCards = [
  {
    icon: '✦',
    title: 'What it does',
    text: 'InvestClear turns financial statements, market context, and recent news into a structured investment report.',
  },
  {
    icon: '⚡',
    title: 'How AI helps',
    text: 'AI connects the dots across data sources so investors can review rationale and evidence faster.',
  },
  {
    icon: '✓',
    title: 'Why it exists',
    text: 'Built to make high-quality investment research more accessible for thoughtful investors.',
  },
]

const futurePlans = [
  { title: 'Portfolio Analysis', text: 'Track holdings and get aggregate signals across your watchlist.' },
  { title: 'Company Comparison', text: 'Side-by-side fundamentals, valuation, and news for multiple tickers.' },
  { title: 'Better Charts', text: 'Interactive price, earnings, and valuation visualizations.' },
  { title: 'Watchlist', text: 'Save companies and revisit reports without re-running them.' },
  { title: 'Conversational Follow-ups', text: 'Ask follow-up questions grounded in your generated research.' },
  { title: 'Historical Reports', text: 'Browse past analyses and see how theses evolved over time.' },
  { title: 'Advanced Valuation Models', text: 'DCF, comparable multiples, and scenario analysis.' },
  { title: 'Risk Scoring', text: 'Quantified volatility, leverage, and concentration risk.' },
]

export default function AboutPage() {
  const profileImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="120" fill="#2563eb" />
      <circle cx="120" cy="100" r="42" fill="#ffffff" opacity="0.94" />
      <rect x="56" y="152" width="128" height="44" rx="22" fill="#ffffff" opacity="0.94" />
      <text x="120" y="118" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="#0f172a">MR</text>
    </svg>
  `)}`

  return (
    <main className="about-page">
      <section className="about-hero">
        <p className="section-label">About InvestClear</p>
        <h1>Built for thoughtful investors and curious builders.</h1>
        <p className="about-copy">
          InvestClear is a personal investment research tool designed to simplify investment research by turning
          complex financial information into a clear, structured report. The goal is to make high-quality research
          more approachable for individuals who want better context before they invest.
        </p>
      </section>

      <section className="about-section">
        <div className="about-cards">
          {aboutCards.map((card) => (
            <article key={card.title} className="about-icon-card">
              <div className="about-icon-card__icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="vision-card">
          <p className="section-label">Vision</p>
          <h2>Our vision</h2>
          <p className="about-copy">
            To make professional-grade investment research accessible, understandable, and useful for everyone.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="mission-card">
          <p className="section-label">Mission</p>
          <h2>Our mission</h2>
          <p className="about-copy">
            To combine financial data, news, and structured analysis into a calm, reliable workflow that helps
            people make more informed decisions with confidence.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="section-card__header">
          <div>
            <p className="section-label">How it works</p>
            <h2>Simple workflow</h2>
          </div>
        </div>
        <div className="workflow-steps">
          {workflowSteps.map((step, index) => (
            <div key={step} className="workflow-step">
              <span className="workflow-step__number">{String(index + 1).padStart(2, '0')}</span>
              <span className="workflow-step__text">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="section-card__header">
          <div>
            <p className="section-label">Future planning</p>
            <h2>Currently improving</h2>
          </div>
        </div>
        <div className="feature-grid">
          {futurePlans.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section profile-card">
        <img className="profile-photo" src={profileImage} alt="Portrait illustration of Mohan Rao" />
        <div>
          <p className="section-label">About the developer</p>
          <h2>Mohan Rao</h2>
          <p className="role-pill">Computer Science Student</p>
          <p className="about-copy">
            I'm passionate about Artificial Intelligence, software engineering, and building practical products that
            solve real-world problems. InvestClear is a personal project focused on making professional-grade
            investment research accessible through structured data analysis.
          </p>
        </div>
      </section>

      <section className="about-section contact-cards">
        <article className="contact-card">
          <p className="section-label">Email</p>
          <a className="contact-link" href="mailto:gedalamohanraolpu@gmail.com">gedalamohanraolpu@gmail.com</a>
        </article>
        <article className="contact-card">
          <p className="section-label">GitHub</p>
          <a className="contact-link" href="https://github.com/mohanrao06" target="_blank" rel="noreferrer">
            github.com/mohanrao
          </a>
        </article>
        <article className="contact-card">
          <p className="section-label">LinkedIn</p>
          <a className="contact-link" href="https://www.linkedin.com/in/gedalamohanrao06/" target="_blank" rel="noreferrer">
            linkedin.com/in/mohanrao
          </a>
        </article>
      </section>
    </main>
  )
}