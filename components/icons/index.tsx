import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: P, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "square" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

export const UploadIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <path d="M12 16V4" />
    <path d="M6 10l6-6 6 6" />
    <path d="M4 20h16" />
  </svg>
);

export const ShareIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <path d="M12 15V3M7 8l5-5 5 5" />
    <path d="M5 12v9h14v-9" />
  </svg>
);

export const GhostIcon = (p: P) => (
  <svg {...base(p, 2.2)} strokeLinecap="butt" strokeLinejoin="round">
    <path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-1.8-2.3 1.8-2.4-1.8-2.4 1.8-2.3-1.8z" />
    <path d="M9.5 10h.01M14.5 10h.01" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </svg>
);

export const ExternalIcon = (p: P) => (
  <svg {...base(p, 3)}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p, 3)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const HelpIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
    <path d="M12 17h.01" />
  </svg>
);

export const WarningIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18h.01" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <rect x="4" y="10" width="16" height="11" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const DeviceIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <rect x="6" y="2" width="12" height="20" />
    <path d="M11 18h2" />
  </svg>
);

export const CodeIcon = (p: P) => (
  <svg {...base(p, 2.5)}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
    <path d="M14 4l-4 16" />
  </svg>
);

export const CoffeeIcon = (p: P) => (
  <svg {...base(p, 2)}>
    <path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M17 11h2a2 2 0 0 1 0 4h-2" />
    <path d="M8 3v3M12 3v3" />
  </svg>
);
