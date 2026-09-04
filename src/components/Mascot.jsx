export default function Mascot({ className = 'mooca', src }) {
  return <img className={className} src={src} alt="" />;
}

export function Logo({ className = '' }) {
  return <img className={`logo-mark-img ${className}`} src="/assets/logo.png" alt="mindfull" />;
}