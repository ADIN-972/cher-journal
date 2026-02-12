import React from 'react';
import { useLanguage, useTranslation, Language } from '../lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'select' | 'icon';
}

export function LanguageSwitcher({ className = '', variant = 'select' }: LanguageSwitcherProps) {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as Language);
  };

  if (variant === 'select') {
    return (
      <div className={`language-switcher ${className}`}>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="language-select"
          aria-label={t('header.language')}
          title={t('header.language')}
        >
          <option value="en">{t('header.english')}</option>
          <option value="fr">{t('header.french')}</option>
        </select>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`language-switcher-buttons ${className}`}>
        <button
          onClick={() => changeLanguage('en')}
          className={`language-button ${language === 'en' ? 'active' : ''}`}
          aria-pressed={language === 'en'}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('fr')}
          className={`language-button ${language === 'fr' ? 'active' : ''}`}
          aria-pressed={language === 'fr'}
        >
          Français
        </button>
      </div>
    );
  }

  // icon variant
  return (
    <div className={`language-switcher-icon ${className}`}>
      <button
        onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
        className="language-icon-button"
        title={t('header.language')}
        aria-label={`${t('header.language')}: ${language === 'en' ? 'English' : 'Français'}`}
      >
        <span className="language-code">{language.toUpperCase()}</span>
      </button>
    </div>
  );
}

// Styles (optional - can be in global CSS or Tailwind)
const styles = `
.language-switcher,
.language-switcher-buttons,
.language-switcher-icon {
  display: inline-block;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.language-select:hover {
  border-color: #999;
}

.language-select:focus {
  outline: 2px solid #4CAF50;
  outline-offset: 2px;
}

.language-switcher-buttons {
  display: flex;
  gap: 0.5rem;
}

.language-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.language-button:hover {
  border-color: #999;
  background-color: #f5f5f5;
}

.language-button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.language-icon-button {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.language-icon-button:hover {
  border-color: #999;
  background-color: #f5f5f5;
}

.language-code {
  display: inline-block;
}
`;

export default LanguageSwitcher;
