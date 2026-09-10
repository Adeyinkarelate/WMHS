import { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icons = {
  home: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  ),
  pulse: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </Svg>
  ),
  flask: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 3h6M10 3v5.2L5.4 17a3 3 0 0 0 2.6 4.5h8a3 3 0 0 0 2.6-4.5L14 8.2V3" />
    </Svg>
  ),
  shield: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 8.5 4.2-1.1 7-4.3 7-8.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  pin: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </Svg>
  ),
  clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </Svg>
  ),
  chat: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 17.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3.5Z" />
    </Svg>
  ),
  user: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.2-3 3.7-4.5 7-4.5S17.8 16 19 19" />
    </Svg>
  ),
  users: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.9-2.8 3-4.2 6-4.2s5.1 1.4 6 4.2" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 14.8c1.8.3 3.2 1.3 4 3.2" />
    </Svg>
  ),
  grid: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  bell: (p: IconProps) => (
    <Svg {...p}>
      <path d="M15 17H9c-2.8 0-4.2 0-4.9-.8-.4-.5-.6-1.1-.4-1.8.1-.4.8-1 2.1-2.2.7-.6 1.1-1.7 1.1-3.2C6.9 5.8 9.1 4 12 4s5.1 1.8 5.1 5c0 1.5.4 2.6 1.1 3.2 1.3 1.2 2 1.8 2.1 2.2.2.7 0 1.3-.4 1.8-.7.8-2.1.8-4.9.8Z" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </Svg>
  ),
  send: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12 14-7-4 16-4-6-6-3Z" />
    </Svg>
  ),
  plus: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  upload: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 16V6m0 0 4 4M12 6 8 10" />
      <path d="M5 18h14" />
    </Svg>
  ),
  logout: (p: IconProps) => (
    <Svg {...p}>
      <path d="M10 7V5a1 1 0 0 1 1-1h8v16h-8a1 1 0 0 1-1-1v-2" />
      <path d="M4 12h10M11 8l4 4-4 4" />
    </Svg>
  ),
  menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  ),
  close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  ),
  arrow: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  arrowUp: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Svg>
  ),
  plusMark: (p: IconProps) => (
    <Svg {...p} strokeWidth={2.4}>
      <path d="M12 6v12M6 12h12" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12 5 5 9-10" />
    </Svg>
  ),
  more: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" />
    </Svg>
  ),
  spark: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M4.9 6.5l2.8 2.8M16.3 14.7l2.8 2.8M3 12h4M17 12h4M4.9 17.5l2.8-2.8M16.3 9.3l2.8-2.8" />
    </Svg>
  ),
  heart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
    </Svg>
  ),
  phone: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M10 18h4" />
    </Svg>
  ),
  eye: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  eyeOff: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2.2 2.2 0 0 0 2.8 2.8" />
      <path d="M9.4 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.3 4.4" />
      <path d="M6.7 6.7C4 8.6 2 12 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4.4-1" />
    </Svg>
  ),
};
