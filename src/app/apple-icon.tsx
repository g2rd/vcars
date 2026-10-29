import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32">
          <path d="M7.5 9h4.1l4.4 10.4L20.4 9h4.1l-6.6 15h-3.8z" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
