import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BRACKET = { position: "absolute", border: "2.2px solid #fcfcfc" } as const;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 9,
          background: "#2e7c35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ ...BRACKET, top: 6, left: 6, width: 6, height: 6, borderRight: "none", borderBottom: "none", borderTopLeftRadius: 3 }} />
        <div style={{ ...BRACKET, top: 6, right: 6, width: 6, height: 6, borderLeft: "none", borderBottom: "none", borderTopRightRadius: 3 }} />
        <div style={{ ...BRACKET, bottom: 6, left: 6, width: 6, height: 6, borderRight: "none", borderTop: "none", borderBottomLeftRadius: 3 }} />
        <div style={{ ...BRACKET, bottom: 6, right: 6, width: 6, height: 6, borderLeft: "none", borderTop: "none", borderBottomRightRadius: 3 }} />
        <div style={{ width: 6, height: 6, borderRadius: 999, background: "#fcfcfc" }} />
      </div>
    ),
    size,
  );
}
