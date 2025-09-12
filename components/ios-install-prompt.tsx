"use client"

import React from "react";

/**
 * iOSInstallPrompt
 * Shows a custom prompt for iOS users to add the PWA to their home screen.
 * Only visible on iOS Safari, when not already installed.
 */
const isIos = () => {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

const isInStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  // @ts-ignore
  return window.navigator.standalone === true;
};

export const IOSInstallPrompt: React.FC = () => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isIos() && !isInStandaloneMode()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#fffbe8",
      color: "#333",
      borderTop: "1px solid #e0e0e0",
      padding: "1rem",
      zIndex: 1000,
      textAlign: "center",
      fontSize: "1rem"
    }}>
      <span role="img" aria-label="Share">📲</span> To install this app, tap <b>Share</b> <span role="img" aria-label="Share">[⇧]</span> then <b>Add to Home Screen</b>.
      <button style={{marginLeft: "1rem"}} onClick={() => setShow(false)}>Dismiss</button>
    </div>
  );
};

export default IOSInstallPrompt;
