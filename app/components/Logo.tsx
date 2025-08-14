"use client";
import React from "react";

export default function Logo({ size = 100 }: { size?: number }) {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
  };

  const shapeSize = Math.round(size * 0.8);
  const iconSize = Math.round(size * 0.4);
  const coinSize = Math.round(iconSize * 0.375);
  const nftSize = coinSize;

  const shapeStyle: React.CSSProperties = {
    width: shapeSize,
    height: shapeSize,
    borderRadius: Math.round(shapeSize * 0.25),
    background: "linear-gradient(135deg, #e53935 60%, #8e24aa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(142,36,170,0.10)",
  };

  const iconStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const coinStyle: React.CSSProperties = {
    position: "absolute",
    left: Math.round(iconSize * 0.2),
    top: Math.round(iconSize * 0.3),
    width: coinSize,
    height: coinSize,
    borderRadius: "50%",
    background: "#e53935",
    border: "2px solid #8e24aa",
    boxShadow: "0 1px 4px rgba(229,57,53,0.25)",
  };

  const nftStyle: React.CSSProperties = {
    position: "absolute",
    right: Math.round(iconSize * 0.2),
    bottom: Math.round(iconSize * 0.3),
    width: nftSize,
    height: nftSize,
    borderRadius: Math.round(nftSize * 0.25),
    background: "#8e24aa",
    border: "2px solid #e53935",
    boxShadow: "0 1px 4px rgba(142,36,170,0.18)",
  };

  return (
    <div style={containerStyle} aria-hidden>
      <div style={shapeStyle}>
        <div style={iconStyle}>
          <div style={coinStyle} />
          <div style={nftStyle} />
        </div>
      </div>
    </div>
  );
}
