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

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z" />
  </Icon>
);

export const VanIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2h3l3 4v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2zm4 10.5A1.5 1.5 0 1 0 6 19a1.5 1.5 0 0 0 0-3zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM18 10v2h2.5L19 10z" />
  </Icon>
);

export const InboxIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4h16l2 9v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6zm1.6 2L4.2 12H9a3 3 0 0 0 6 0h4.8L18.4 6z" />
  </Icon>
);

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z" />
  </Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.8 4h2.4v6.8H20v2.4h-6.8V20h-2.4v-6.8H4v-2.4h6.8z" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7z" />
  </Icon>
);

export const ArrowUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 4 8 8-1.8 1.8-5-5V20h-2.4V8.8l-5 5L4 12z" />
  </Icon>
);

export const ArrowDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 20-8-8 1.8-1.8 5 5V4h2.4v11.2l5-5L20 12z" />
  </Icon>
);

export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 3h9v2H6v14h7v2H4zm12 4 5 5-5 5-1.4-1.4 2.6-2.6H9v-2h8.2l-2.6-2.6z" />
  </Icon>
);

export const ExternalLinkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14zM5 5h6v2H7v10h10v-4h2v6H5z" />
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
