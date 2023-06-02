function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function redirectToMigration() {
    localStorage.setItem('migration_originalUrlParams', window.location.search);
    localStorage.setItem('migration_originalUrlHash', window.location.hash);
    let mintingAppMigrationUrl = `${window.env.mintingAppUrl}/migration.html?no-migration=true`;
    const url = new URL(window.location.href)
    localStorage.setItem(`sc_referrer`, document?.referrer);
    if (url.pathname) mintingAppMigrationUrl += `&callbackPath=${url.pathname}`;
    window.location.href = mintingAppMigrationUrl;
}

function removeQueryParameters(paramsToRemove) {
    const url = new URL(window.location.href);
    paramsToRemove.forEach(param => url.searchParams.delete(param));
    window.history.replaceState({}, '', url);
}

function restoreOriginalUrl() {
    const url = new URL(window.location.href);
    const originalUrlParams = localStorage.getItem('migration_originalUrlParams');
    if (originalUrlParams) {
        url.search = originalUrlParams;
        localStorage.removeItem('migration_originalUrlParams');
    }
    const originalUrlHash = localStorage.getItem('migration_originalUrlHash');
    if (originalUrlHash) {
        url.hash = originalUrlHash;
        localStorage.removeItem('migration_originalUrlHash');
    }
    if (originalUrlParams || originalUrlHash) {
        window.history.replaceState({}, '', url);
    }
}

function checkAndProcessParamsKey() {
    const noMigration = getQueryParam("no-migration");
    if(noMigration) return;
    const as_sismo_ct = getQueryParam('as_sismo_ct');
    const as_sismo_ek = getQueryParam('as_sismo_ek');
    removeQueryParameters(['as_sismo_ct', 'as_sismo_ek']);
    restoreOriginalUrl();
    if (as_sismo_ct === "not-connected") return;

    if (as_sismo_ct && as_sismo_ek) {
        localStorage.setItem('minting_app_ct', as_sismo_ct);
        localStorage.setItem('minting_app_ek', as_sismo_ek);
    } else if (!localStorage.getItem('minting_app_ct')) {
        redirectToMigration();
    }
}

// If mintingAppUrl in env is null, do not import ct and ek 
if (window.env.mintingAppUrl) checkAndProcessParamsKey();