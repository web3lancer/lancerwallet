export default function Hero() {
  return (
    <section 
      className="text-center fade-in"
      style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <h1 
        style={{
          fontSize: '40px',
          lineHeight: '52px',
          letterSpacing: '-1.25px',
          fontWeight: '700',
          marginBottom: 'var(--space-4)',
          color: 'var(--text-primary)'
        }}
      >
        A beautiful, secure open-source crypto wallet
      </h1>
      <p 
        style={{
          fontSize: '18px',
          lineHeight: '28px',
          letterSpacing: '-0.25px',
          marginBottom: 'var(--space-8)',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto var(--space-8) auto'
        }}
      >
        LancerWallet is a community-driven wallet focused on security, simplicity, and a delightful user experience across devices.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <a 
          href="/onboarding" 
          className="btn-primary"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '18px',
            padding: 'var(--space-5) var(--space-8)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          Enter App
        </a>
        <a 
          href="#features" 
          className="btn-secondary"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '18px',
            padding: 'var(--space-5) var(--space-8)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          Learn more
        </a>
      </div>
    </section>
  );
}
