(async () => {
  try {
    await import('@testing-library/jest-dom');
  } catch (err) {
    // Optional: jest-dom not installed, continue without it (useful for minimal dev environments)
    // Installing `@testing-library/jest-dom` is recommended to get extended matchers.
    // npm install -D @testing-library/jest-dom
    // eslint-disable-next-line no-console
    console.warn('Optional dependency @testing-library/jest-dom not available:', err?.message ?? err);
  }
})();
