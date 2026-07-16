/**
 * Flexxy Internationalization System
 * English + Czech UI translations via /locales/*.json
 * Adapted from cdot-landing i18n pattern.
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.defaultLanguage = 'en';
        this.availableLanguages = {
            en: { name: 'English', flag: '🇬🇧', code: 'en' },
            cs: { name: 'Čeština', flag: '🇨🇿', code: 'cs' }
        };
        this.isLoading = false;
        this.loadPromises = {};
        this.ready = false;
        this.initPromise = this.init();
    }

    async init() {
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = (navigator.language || 'en').toLowerCase().split('-')[0];

        let initialLang = this.defaultLanguage;
        if (savedLang && this.availableLanguages[savedLang]) {
            initialLang = savedLang;
        } else if (this.availableLanguages[browserLang]) {
            initialLang = browserLang;
        }

        // Always load English as fallback first
        await this.loadTranslations('en');
        await this.setLanguage(initialLang);
        this.setupLanguageSwitcher();
        this.ready = true;
        console.log(`I18n initialized with language: ${initialLang}`);
    }

    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }
        if (this.loadPromises[lang]) {
            return this.loadPromises[lang];
        }

        this.loadPromises[lang] = this.fetchTranslations(lang);
        try {
            const translations = await this.loadPromises[lang];
            this.translations[lang] = translations;
            delete this.loadPromises[lang];
            return translations;
        } catch (error) {
            delete this.loadPromises[lang];
            throw error;
        }
    }

    async fetchTranslations(lang) {
        try {
            const url = lang === 'en'
                ? '/locales/source.en.json'
                : `/locales/${lang}.json`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}: ${response.status}`);
            }
            const translations = await response.json();
            console.log(`Loaded ${Object.keys(translations).length} translations for ${lang}`);
            return translations;
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            return {};
        }
    }

    async setLanguage(lang) {
        if (!this.availableLanguages[lang]) {
            console.warn(`Language ${lang} not available, falling back to ${this.defaultLanguage}`);
            lang = this.defaultLanguage;
        }

        this.isLoading = true;
        try {
            await this.loadTranslations(lang);
            this.currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            this.updateContent();
            this.updateLanguageSwitcher();
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang, translations: this.translations[lang] }
            }));
            console.log(`Language changed to: ${lang}`);
        } catch (error) {
            console.error(`Failed to set language to ${lang}:`, error);
            if (lang !== this.defaultLanguage) {
                await this.setLanguage(this.defaultLanguage);
            }
        } finally {
            this.isLoading = false;
        }
    }

    translate(key, fallback = null) {
        const translations = this.translations[this.currentLanguage];

        if (translations && translations[key] !== undefined) {
            return translations[key];
        }

        const nested = this.getNestedTranslation(translations, key);
        if (nested !== undefined) {
            if (typeof nested === 'object' && nested !== null) {
                const extracted = this.extractPreferredStringFromObject(nested);
                if (extracted !== undefined) return extracted;
            } else {
                return nested;
            }
        }

        if (this.currentLanguage !== 'en' && this.translations.en) {
            if (this.translations.en[key] !== undefined) {
                return this.translations.en[key];
            }
            const englishNested = this.getNestedTranslation(this.translations.en, key);
            if (englishNested !== undefined) {
                if (typeof englishNested === 'object' && englishNested !== null) {
                    const enExtracted = this.extractPreferredStringFromObject(englishNested);
                    if (enExtracted !== undefined) return enExtracted;
                } else {
                    return englishNested;
                }
            }
        }

        return fallback != null ? fallback : this.convertKeyToText(key);
    }

    t(key, fallback = null) {
        return this.translate(key, fallback);
    }

    extractPreferredStringFromObject(obj) {
        if (!obj || typeof obj !== 'object') return undefined;
        const prefer = ['title', 'label', 'text', 'desc', 'name', 'value', 'entry', 'button'];
        for (let i = 0; i < prefer.length; i++) {
            const k = prefer[i];
            if (Object.prototype.hasOwnProperty.call(obj, k) && typeof obj[k] === 'string') {
                return obj[k];
            }
        }
        const stringValues = Object.values(obj).filter(v => typeof v === 'string');
        if (stringValues.length === 1) return stringValues[0];
        return undefined;
    }

    convertKeyToText(key) {
        key = key.replace(/\./g, ' ');
        return key
            .replace(/^(footer|sidebar|nav|menu|page|form|button|link|text|label)/i, '')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/\s+(header|link|title|label|page|button|text|message|prompt|error|placeholder|option)$/i, '')
            .replace(/\s+/g, ' ')
            .trim()
            || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    }

    getNestedTranslation(translations, key) {
        if (!translations || !key) return undefined;
        const parts = key.split('.');
        let current = translations;
        for (let i = 0; i < parts.length; i++) {
            if (current && Object.prototype.hasOwnProperty.call(current, parts[i])) {
                current = current[parts[i]];
            } else {
                return undefined;
            }
        }
        return current;
    }

    applyToElement(element) {
        if (!element || !element.getAttribute) return;

        if (element.hasAttribute('data-i18n')) {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            const tag = element.tagName;

            if (tag === 'INPUT') {
                if (element.type === 'button' || element.type === 'submit' || element.type === 'reset') {
                    element.value = translation;
                } else {
                    // Prefer dedicated placeholder attr if present
                    if (!element.hasAttribute('data-i18n-placeholder')) {
                        element.placeholder = translation;
                    }
                }
            } else if (tag === 'TEXTAREA') {
                if (!element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                }
            } else if (tag === 'OPTION') {
                element.textContent = translation;
            } else if (tag === 'IMG') {
                element.alt = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }

        if (element.hasAttribute('data-i18n-placeholder')) {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            }
        }

        if (element.hasAttribute('data-i18n-alt')) {
            const key = element.getAttribute('data-i18n-alt');
            element.alt = this.translate(key);
        }

        if (element.hasAttribute('data-i18n-title') && element.tagName !== 'TITLE') {
            const key = element.getAttribute('data-i18n-title');
            element.setAttribute('title', this.translate(key));
        }

        if (element.hasAttribute('data-i18n-aria-label')) {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.translate(key));
        }
    }

    updateContent(root = document) {
        const scope = root.querySelectorAll
            ? root
            : document;

        scope.querySelectorAll('[data-i18n]').forEach(el => this.applyToElement(el));
        scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => this.applyToElement(el));
        scope.querySelectorAll('[data-i18n-alt]').forEach(el => this.applyToElement(el));
        scope.querySelectorAll('[data-i18n-title]').forEach(el => {
            if (el.tagName !== 'TITLE') this.applyToElement(el);
        });
        scope.querySelectorAll('[data-i18n-aria-label]').forEach(el => this.applyToElement(el));

        const titleElement = document.querySelector('title[data-i18n-title]');
        if (titleElement) {
            document.title = this.translate(titleElement.getAttribute('data-i18n-title'));
        }

        document.documentElement.lang = this.currentLanguage === 'cs' ? 'cs' : 'en';
    }

    setupLanguageSwitcher() {
        // All language <select> elements (desktop + mobile)
        document.querySelectorAll('select.language-switcher, #language-switcher, #language-switcher-mobile').forEach(langSwitcher => {
            if (langSwitcher.dataset.i18nBound) return;
            langSwitcher.dataset.i18nBound = '1';
            langSwitcher.value = this.currentLanguage;
            langSwitcher.addEventListener('change', async (event) => {
                const newLang = event.target.value;
                if (newLang !== this.currentLanguage) {
                    langSwitcher.disabled = true;
                    try {
                        await this.setLanguage(newLang);
                    } catch (error) {
                        console.error('Failed to change language:', error);
                        langSwitcher.value = this.currentLanguage;
                    } finally {
                        langSwitcher.disabled = false;
                    }
                }
            });
        });

        // Buttons / links with data-lang
        document.querySelectorAll('[data-lang].lang-option, button[data-lang], a.lang-option[data-lang]').forEach(btn => {
            if (btn.dataset.i18nBound) return;
            btn.dataset.i18nBound = '1';
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const newLang = btn.getAttribute('data-lang');
                if (newLang && newLang !== this.currentLanguage) {
                    await this.setLanguage(newLang);
                }
            });
        });

        this.updateLanguageSwitcher();
    }

    updateLanguageSwitcher() {
        document.querySelectorAll('select.language-switcher, #language-switcher, #language-switcher-mobile').forEach(el => {
            el.value = this.currentLanguage;
        });
        document.querySelectorAll('[data-lang].lang-option, button[data-lang], a.lang-option[data-lang]').forEach(btn => {
            const active = btn.getAttribute('data-lang') === this.currentLanguage;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        const label = document.getElementById('language-switcher-label');
        if (label && this.availableLanguages[this.currentLanguage]) {
            label.textContent = this.availableLanguages[this.currentLanguage].name;
        }
    }

    /** Re-apply translations after async header/footer inject */
    refresh() {
        this.updateContent();
        this.setupLanguageSwitcher();
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getAvailableLanguages() {
        return this.availableLanguages;
    }

    isLanguageAvailable(lang) {
        return !!this.availableLanguages[lang];
    }

    async whenReady() {
        return this.initPromise;
    }
}

const i18n = new I18nManager();
window.i18n = i18n;
window.setLanguage = (lang) => i18n.setLanguage(lang);
window.updateContent = () => i18n.updateContent();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18n.refresh();
    });
} else {
    i18n.refresh();
}

setTimeout(() => {
    window.dispatchEvent(new CustomEvent('i18nReady', { detail: { i18n } }));
}, 200);
