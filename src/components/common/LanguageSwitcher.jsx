import { useTranslation } from 'react-i18next'; // Importação adicionada

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div>
      <button
        className={`lang-switcher-btn ${i18n.resolvedLanguage === 'pt' ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('pt')}
      >
        PT
      </button>
      <button
        className={`lang-switcher-btn ${i18n.resolvedLanguage === 'en' ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;