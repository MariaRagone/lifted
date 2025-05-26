import React, { useEffect } from "react";

const APP_VERSION = "2025-05-24-v1"; // 🔁 Update on each deploy

const CHANGELOG_MESSAGE = `🚀 What's New:
- ✅ Lift Circles show progress bars
- 📅 Daily checkmarks now persist correctly
- 🛠 Bug fixes and UI improvements
- 📣 Users can create and join unique groups
`;

const DeployAlert: React.FC = () => {
  useEffect(() => {
    const seenVersion = localStorage.getItem("seenAppVersion");
    if (seenVersion !== APP_VERSION) {
      alert(CHANGELOG_MESSAGE);
      localStorage.setItem("seenAppVersion", APP_VERSION);
    }
  }, []);

  return null; // This component doesn't render any visible UI
};

export default DeployAlert;
