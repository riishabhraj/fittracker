"use client"

import React from "react";

/**
 * BrowserInstallPrompt
 * Shows a custom install prompt for browsers that support the PWA install event (e.g., Chrome on Android).
 * Handles the beforeinstallprompt event and displays a custom UI.
 */
export const BrowserInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#e3fcec",
      color: "#333",
      borderTop: "1px solid #b2f5ea",
      padding: "1rem",
      zIndex: 1000,
      textAlign: "center",
      fontSize: "1rem"
    }}>
      <span role="img" aria-label="Install">⬇️</span> Install this app for a better experience.
      <button style={{marginLeft: "1rem"}} onClick={handleInstall}>Install</button>
      <button style={{marginLeft: "0.5rem"}} onClick={() => setShow(false)}>Dismiss</button>
    </div>
  );
};

export default BrowserInstallPrompt;
