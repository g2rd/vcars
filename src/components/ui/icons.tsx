import type { SVGProps } from "react";

/** Pełne, czarne glify (bez konturów) – zgodnie z zasadami ikonografii. */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PhoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18v2.5H3zM3 10.75h18v2.5H3zM3 15.5h18V18H3z" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5.7 3.9 6.3 6.3 6.3-6.3 1.8 1.8-6.3 6.3 6.3 6.3-1.8 1.8-6.3-6.3-6.3 6.3-1.8-1.8 6.3-6.3-6.3-6.3z" />
  </Icon>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13.2 4.4 20.8 12l-7.6 7.6-1.8-1.8 4.5-4.5H3v-2.6h12.9l-4.5-4.5z" />
  </Icon>
);

export const PinIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </Icon>
);

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.2 5v4.8l3.7 2.2-1 1.7-4.9-2.9V7z" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9.5 16.6-4.1-4.1L3.6 14.3l5.9 5.9L21 8.7l-1.8-1.8z" />
  </Icon>
);

/** Znaczniki osi czasu przy polach odbioru (kółko) i zwrotu (kwadrat). */
export const DotIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="6" />
  </Icon>
);

export const SquareIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <rect x="6" y="6" width="12" height="12" />
  </Icon>
);
