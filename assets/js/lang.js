function updateContent(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = langData[key];
        }
    });
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
        const label = element.getAttribute('data-i18n-label');
        if (label) {
            element.placeholder = langData[label];
        }
    });
}

function setLanguagePreference(lang) {
    localStorage.setItem('language', lang);
    //location.reload();
}

async function fetchLanguageData(lang) {
    const response = await fetch("assets/lang/"+lang+".json?v1.1");
    return response.json();
}

async function changeLanguage(lang) {
    await setLanguagePreference(lang);
    const langData = await fetchLanguageData(lang);
    updateContent(langData);
    $('#flags li [data-lang]').removeClass('active');
    $('#flags li [data-lang="'+lang+'"]').addClass('active');
    $('html').attr('lang', lang);
    //toggleArabicStylesheet(lang); // Toggle Arabic stylesheet
}

window.addEventListener('DOMContentLoaded', async () => {
    const userPreferredLanguage = localStorage.getItem('language') || 'fa';
    $('#flags li [data-lang]').removeClass('active');
    $('#flags li [data-lang="'+userPreferredLanguage+'"]').addClass('active');
    $('html').attr('lang', userPreferredLanguage);
    console.log(userPreferredLanguage)
    const langData = await fetchLanguageData(userPreferredLanguage);
    updateContent(langData);
    //toggleArabicStylesheet(userPreferredLanguage);
});

$(document).on('click', 'a[data-lang]', function(e) {
    e.preventDefault();
    let lang = $(this).data('lang');
    changeLanguage(lang);
});