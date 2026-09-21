interface EECLogoProps {
  size?: number;
  className?: string;
}

export default function EECLogo({ size = 36, className = '' }: EECLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EEC Logo"
    >
      {/* Outer hexagon */}
      <polygon
        points="20,2 36,11 36,29 20,38 4,29 4,11"
        fill="#00A7D6"
        opacity="0.18"
      />
      {/* Inner hexagon */}
      <polygon
        points="20,7 31,13.5 31,26.5 20,33 9,26.5 9,13.5"
        fill="#00A7D6"
        opacity="0.35"
      />
      {/* E letter mark */}
      <rect x="13" y="14" width="9" height="2.5" rx="1" fill="#FFFFFF" />
      <rect x="13" y="18.75" width="7" height="2.5" rx="1" fill="#FFFFFF" />
      <rect x="13" y="23.5" width="9" height="2.5" rx="1" fill="#FFFFFF" />
      {/* Accent dot */}
      <circle cx="28" cy="14" r="2.5" fill="#C96F59" />
    </svg>
  );
}
