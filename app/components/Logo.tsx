"use client";
import React from "react";

export default function Logo({ size = 100 }: { size?: number }) {
  // Direct translation of your HTML/CSS logo
  const scale = size / 100;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
      aria-label="Crypto & NFT Wallet Logo"
    >
      <div
        style={{
          width: 80 * scale,
          height: 80 * scale,
          borderRadius: 20 * scale,
          background: "linear-gradient(135deg, #e53935 60%, #8e24aa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(142,36,170,0.10)",
        }}
      >
        <div
          style={{
            width: 40 * scale,
            height: 40 * scale,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 8 * scale,
              top: 12 * scale,
              width: 15 * scale,
              height: 15 * scale,
              borderRadius: "50%",
              background: "#e53935",
              border: `${2 * scale}px solid #8e24aa`,
              boxShadow: "0 1px 4px rgba(229,57,53,0.25)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 8 * scale,
              bottom: 12 * scale,
              width: 15 * scale,
              height: 15 * scale,
              borderRadius: 5 * scale,
              background: "#8e24aa",
              border: `${2 * scale}px solid #e53935`,
              boxShadow: "0 1px 4px rgba(142,36,170,0.18)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

