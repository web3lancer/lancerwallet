import Logo from "../Logo";

export default function Header() {
  return (
    <header 
      className="flex items-center justify-between"
      style={{
        padding: 'var(--space-6)',
        background: 'transparent'
      }}
    >
      <div className="flex items-center gap-3">
        <Logo size={36} />
      </div>
      <div>
        <a 
          href="/onboarding" 
          className="btn-primary"
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px'
          }}
        >
          Enter App
        </a>
      </div>
    </header>
  );
}
