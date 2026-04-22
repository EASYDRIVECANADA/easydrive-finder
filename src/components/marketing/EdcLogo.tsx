import { Link } from "@tanstack/react-router";

type Variant = "default" | "light";

export function EdcLogo({
  className = "",
  variant = "default",
  asLink = true,
}: {
  className?: string;
  variant?: Variant;
  asLink?: boolean;
}) {
  const monoColor = variant === "light" ? "#3b9eff" : "#3b9eff";
  const wordColor = variant === "light" ? "#ffffff" : "#0a1628";

  const inner = (
    <div className={`flex items-center gap-0 ${className}`}>
      <svg
        viewBox="0 0 220 110"
        xmlns="http://www.w3.org/2000/svg"
        className="h-11 w-auto"
        aria-label="EasyDrive Canada"
      >
        {/* EDC monogram — bold rounded sans, blue */}
        <g fill={monoColor}>
          {/* E */}
          <path d="M8 14 H62 V30 H28 V42 H58 V58 H28 V70 H62 V86 H8 Z" />
          {/* D */}
          <path d="M76 14 H114 C138 14 152 30 152 50 C152 70 138 86 114 86 H76 Z M96 30 V70 H112 C124 70 132 62 132 50 C132 38 124 30 112 30 Z" />
          {/* C */}
          <path d="M212 28 C204 18 192 12 178 12 C156 12 140 30 140 50 C140 70 156 88 178 88 C192 88 204 82 212 72 L198 62 C194 68 187 72 178 72 C166 72 158 62 158 50 C158 38 166 28 178 28 C187 28 194 32 198 38 Z" />
        </g>
        {/* Wordmark */}
        <text
          x="110"
          y="106"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="13"
          fontWeight="600"
          letterSpacing="3"
          fill={wordColor}
        >
          EASY DRIVE CANADA
        </text>
      </svg>
    </div>
  );

  if (!asLink) return inner;
  return (
    <Link to="/" className="inline-flex items-center" aria-label="EasyDrive Canada home">
      {inner}
    </Link>
  );
}
