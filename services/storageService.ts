import { GitHubConfig } from "../types";

// UNIQUE KEY: Changed to ensure this app has its own isolated storage
// and doesn't share settings with any other versions.
const STORAGE_KEY = 'pinflow_personal_edition_v1';

export const saveGitHubConfig = (config: GitHubConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config to local storage", e);
  }
};

export const loadGitHubConfig = (): GitHubConfig | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load config from local storage", e);
    return null;
  }
};

export const clearGitHubConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};