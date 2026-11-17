try {
  const theme = localStorage.getItem('aura-command-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.commandTheme = theme;
} catch {}
