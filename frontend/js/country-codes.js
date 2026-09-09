(function (global) {
    const POPULAR_ISOS = ['GB', 'IE', 'US', 'CA', 'DE', 'FR', 'NL', 'ES', 'IT', 'AU', 'IN', 'NG', 'ZA', 'PL', 'PT'];

    const COUNTRY_DIAL_CODES = [
        { name: 'Afghanistan', iso: 'AF', dial: '+93' },
        { name: 'Albania', iso: 'AL', dial: '+355' },
        { name: 'Algeria', iso: 'DZ', dial: '+213' },
        { name: 'Andorra', iso: 'AD', dial: '+376' },
        { name: 'Angola', iso: 'AO', dial: '+244' },
        { name: 'Argentina', iso: 'AR', dial: '+54' },
        { name: 'Armenia', iso: 'AM', dial: '+374' },
        { name: 'Australia', iso: 'AU', dial: '+61' },
        { name: 'Austria', iso: 'AT', dial: '+43' },
        { name: 'Azerbaijan', iso: 'AZ', dial: '+994' },
        { name: 'Bahrain', iso: 'BH', dial: '+973' },
        { name: 'Bangladesh', iso: 'BD', dial: '+880' },
        { name: 'Belarus', iso: 'BY', dial: '+375' },
        { name: 'Belgium', iso: 'BE', dial: '+32' },
        { name: 'Belize', iso: 'BZ', dial: '+501' },
        { name: 'Benin', iso: 'BJ', dial: '+229' },
        { name: 'Bolivia', iso: 'BO', dial: '+591' },
        { name: 'Bosnia and Herzegovina', iso: 'BA', dial: '+387' },
        { name: 'Botswana', iso: 'BW', dial: '+267' },
        { name: 'Brazil', iso: 'BR', dial: '+55' },
        { name: 'Brunei', iso: 'BN', dial: '+673' },
        { name: 'Bulgaria', iso: 'BG', dial: '+359' },
        { name: 'Cambodia', iso: 'KH', dial: '+855' },
        { name: 'Cameroon', iso: 'CM', dial: '+237' },
        { name: 'Canada', iso: 'CA', dial: '+1' },
        { name: 'Chile', iso: 'CL', dial: '+56' },
        { name: 'China', iso: 'CN', dial: '+86' },
        { name: 'Colombia', iso: 'CO', dial: '+57' },
        { name: 'Costa Rica', iso: 'CR', dial: '+506' },
        { name: 'Croatia', iso: 'HR', dial: '+385' },
        { name: 'Cyprus', iso: 'CY', dial: '+357' },
        { name: 'Czech Republic', iso: 'CZ', dial: '+420' },
        { name: 'Denmark', iso: 'DK', dial: '+45' },
        { name: 'Dominican Republic', iso: 'DO', dial: '+1' },
        { name: 'Ecuador', iso: 'EC', dial: '+593' },
        { name: 'Egypt', iso: 'EG', dial: '+20' },
        { name: 'Estonia', iso: 'EE', dial: '+372' },
        { name: 'Ethiopia', iso: 'ET', dial: '+251' },
        { name: 'Finland', iso: 'FI', dial: '+358' },
        { name: 'France', iso: 'FR', dial: '+33' },
        { name: 'Georgia', iso: 'GE', dial: '+995' },
        { name: 'Germany', iso: 'DE', dial: '+49' },
        { name: 'Ghana', iso: 'GH', dial: '+233' },
        { name: 'Greece', iso: 'GR', dial: '+30' },
        { name: 'Guatemala', iso: 'GT', dial: '+502' },
        { name: 'Hong Kong', iso: 'HK', dial: '+852' },
        { name: 'Hungary', iso: 'HU', dial: '+36' },
        { name: 'Iceland', iso: 'IS', dial: '+354' },
        { name: 'India', iso: 'IN', dial: '+91' },
        { name: 'Indonesia', iso: 'ID', dial: '+62' },
        { name: 'Iran', iso: 'IR', dial: '+98' },
        { name: 'Iraq', iso: 'IQ', dial: '+964' },
        { name: 'Ireland', iso: 'IE', dial: '+353' },
        { name: 'Israel', iso: 'IL', dial: '+972' },
        { name: 'Italy', iso: 'IT', dial: '+39' },
        { name: 'Jamaica', iso: 'JM', dial: '+1' },
        { name: 'Japan', iso: 'JP', dial: '+81' },
        { name: 'Jordan', iso: 'JO', dial: '+962' },
        { name: 'Kazakhstan', iso: 'KZ', dial: '+7' },
        { name: 'Kenya', iso: 'KE', dial: '+254' },
        { name: 'Kuwait', iso: 'KW', dial: '+965' },
        { name: 'Latvia', iso: 'LV', dial: '+371' },
        { name: 'Lebanon', iso: 'LB', dial: '+961' },
        { name: 'Lithuania', iso: 'LT', dial: '+370' },
        { name: 'Luxembourg', iso: 'LU', dial: '+352' },
        { name: 'Malaysia', iso: 'MY', dial: '+60' },
        { name: 'Malta', iso: 'MT', dial: '+356' },
        { name: 'Mexico', iso: 'MX', dial: '+52' },
        { name: 'Moldova', iso: 'MD', dial: '+373' },
        { name: 'Morocco', iso: 'MA', dial: '+212' },
        { name: 'Netherlands', iso: 'NL', dial: '+31' },
        { name: 'New Zealand', iso: 'NZ', dial: '+64' },
        { name: 'Nigeria', iso: 'NG', dial: '+234' },
        { name: 'Norway', iso: 'NO', dial: '+47' },
        { name: 'Oman', iso: 'OM', dial: '+968' },
        { name: 'Pakistan', iso: 'PK', dial: '+92' },
        { name: 'Peru', iso: 'PE', dial: '+51' },
        { name: 'Philippines', iso: 'PH', dial: '+63' },
        { name: 'Poland', iso: 'PL', dial: '+48' },
        { name: 'Portugal', iso: 'PT', dial: '+351' },
        { name: 'Qatar', iso: 'QA', dial: '+974' },
        { name: 'Romania', iso: 'RO', dial: '+40' },
        { name: 'Russia', iso: 'RU', dial: '+7' },
        { name: 'Saudi Arabia', iso: 'SA', dial: '+966' },
        { name: 'Serbia', iso: 'RS', dial: '+381' },
        { name: 'Singapore', iso: 'SG', dial: '+65' },
        { name: 'Slovakia', iso: 'SK', dial: '+421' },
        { name: 'Slovenia', iso: 'SI', dial: '+386' },
        { name: 'South Africa', iso: 'ZA', dial: '+27' },
        { name: 'South Korea', iso: 'KR', dial: '+82' },
        { name: 'Spain', iso: 'ES', dial: '+34' },
        { name: 'Sri Lanka', iso: 'LK', dial: '+94' },
        { name: 'Sweden', iso: 'SE', dial: '+46' },
        { name: 'Switzerland', iso: 'CH', dial: '+41' },
        { name: 'Taiwan', iso: 'TW', dial: '+886' },
        { name: 'Thailand', iso: 'TH', dial: '+66' },
        { name: 'Turkey', iso: 'TR', dial: '+90' },
        { name: 'Ukraine', iso: 'UA', dial: '+380' },
        { name: 'United Arab Emirates', iso: 'AE', dial: '+971' },
        { name: 'United Kingdom', iso: 'GB', dial: '+44' },
        { name: 'United States', iso: 'US', dial: '+1' },
        { name: 'Uruguay', iso: 'UY', dial: '+598' },
        { name: 'Uzbekistan', iso: 'UZ', dial: '+998' },
        { name: 'Venezuela', iso: 'VE', dial: '+58' },
        { name: 'Vietnam', iso: 'VN', dial: '+84' },
        { name: 'Zimbabwe', iso: 'ZW', dial: '+263' }
    ];

    const LOCALE_TO_ISO = {
        GB: 'GB', UK: 'GB', US: 'US', CA: 'CA', IE: 'IE', AU: 'AU', NZ: 'NZ',
        DE: 'DE', FR: 'FR', ES: 'ES', IT: 'IT', NL: 'NL', BE: 'BE', AT: 'AT',
        CH: 'CH', SE: 'SE', NO: 'NO', DK: 'DK', FI: 'FI', PL: 'PL', PT: 'PT',
        IN: 'IN', NG: 'NG', ZA: 'ZA', BR: 'BR', MX: 'MX', JP: 'JP', KR: 'KR',
        CN: 'CN', AE: 'AE', SA: 'SA', EG: 'EG', KE: 'KE', PK: 'PK', PH: 'PH'
    };

    function optionLabel(country) {
        return `${country.dial} ${country.iso}`;
    }

    function getDialCodeFromLocale() {
        const locale = (global.navigator && navigator.language) || 'en-GB';
        const region = locale.split('-')[1] || locale.split('-')[0] || 'GB';
        const iso = LOCALE_TO_ISO[region.toUpperCase()] || 'GB';
        const match = COUNTRY_DIAL_CODES.find((country) => country.iso === iso);
        return match ? match.dial : '+44';
    }

    function populateCountryCodeSelect(select, options) {
        if (!select) return;

        const settings = options || {};
        const selected = settings.selected || select.getAttribute('data-selected') || select.value || getDialCodeFromLocale();
        const popular = COUNTRY_DIAL_CODES.filter((country) => POPULAR_ISOS.includes(country.iso));
        const popularOrder = new Map(POPULAR_ISOS.map((iso, index) => [iso, index]));
        popular.sort((a, b) => (popularOrder.get(a.iso) || 0) - (popularOrder.get(b.iso) || 0));

        const fragment = document.createDocumentFragment();

        const popularGroup = document.createElement('optgroup');
        popularGroup.label = 'Popular';
        popular.forEach((country) => {
            const option = document.createElement('option');
            option.value = country.dial;
            option.textContent = optionLabel(country);
            option.title = country.name;
            popularGroup.appendChild(option);
        });
        fragment.appendChild(popularGroup);

        const allGroup = document.createElement('optgroup');
        allGroup.label = 'All countries';
        COUNTRY_DIAL_CODES.forEach((country) => {
            const option = document.createElement('option');
            option.value = country.dial;
            option.textContent = `${country.dial} ${country.name}`;
            option.title = country.name;
            allGroup.appendChild(option);
        });
        fragment.appendChild(allGroup);

        select.innerHTML = '';
        select.appendChild(fragment);

        const matchingOption = Array.from(select.options).find((option) => option.value === selected);
        select.value = matchingOption ? selected : getDialCodeFromLocale();
    }

    function initCountryCodeSelects() {
        document.querySelectorAll('select.country-code-select').forEach((select) => {
            populateCountryCodeSelect(select);
        });
    }

    function formatPhoneDisplay(phone, countryCode) {
        if (!phone) return '';
        const trimmed = String(phone).trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('+')) return trimmed;
        if (countryCode) return `${countryCode} ${trimmed}`;
        return trimmed;
    }

    global.CountryCodes = {
        COUNTRY_DIAL_CODES,
        populateCountryCodeSelect,
        getDialCodeFromLocale,
        formatPhoneDisplay,
        initCountryCodeSelects
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCountryCodeSelects);
    } else {
        initCountryCodeSelects();
    }
})(window);
