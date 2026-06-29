export default function HeroSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="hero-glow" aria-hidden="true" />
      <div className="relative z-10">
        <p className="mb-2 eyebrow">{eyebrow}</p>
        <h1 className="mb-4 font-display text-3xl font-bold leading-tight sm:text-display-hero">{title}</h1>
        <p className="mb-6 max-w-prose text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  );
}
