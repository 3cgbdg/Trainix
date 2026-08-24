import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BRACKET = { position: "absolute", border: "13px solid #fcfcfc" } as const;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 40,
          background: "#2e7c35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ ...BRACKET, top: 34, left: 34, width: 34, height: 34, borderRight: "none", borderBottom: "none", borderTopLeftRadius: 16 }} />
        <div style={{ ...BRACKET, top: 34, right: 34, width: 34, height: 34, borderLeft: "none", borderBottom: "none", borderTopRightRadius: 16 }} />
        <div style={{ ...BRACKET, bottom: 34, left: 34, width: 34, height: 34, borderRight: "none", borderTop: "none", borderBottomLeftRadius: 16 }} />
        <div style={{ ...BRACKET, bottom: 34, right: 34, width: 34, height: 34, borderLeft: "none", borderTop: "none", borderBottomRightRadius: 16 }} />
        <div style={{ width: 34, height: 34, borderRadius: 999, background: "#fcfcfc" }} />
      </div>
    ),
    size,
  );
}
