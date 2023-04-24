function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function redirectToMigration() {
    window.location.href = `${window.env.mintingAppUrl}/migration`;
}

function removeQueryParameters(paramsToRemove) {
    const url = new URL(window.location.href);
    paramsToRemove.forEach(param => url.searchParams.delete(param));
    window.history.replaceState({}, '', url);
}

function checkAndProcessParamsKey() {
    const as_sismo_ct = getQueryParam('as_sismo_ct');
    if (as_sismo_ct === "not-connected") return;
    const as_sismo_ek = getQueryParam('as_sismo_ek');
    if (as_sismo_ct && as_sismo_ek) {
        localStorage.setItem('minting_app_ct', as_sismo_ct);
        localStorage.setItem('minting_app_ek', as_sismo_ek);
        removeQueryParameters(['as_sismo_ct', 'as_sismo_ek']);
    } else if (!localStorage.getItem('minting_app_ct')) {
        redirectToMigration();
    }
}

// If mintingAppUrl in env is null, do not import ct and ek 
if (window.env.mintingAppUrl) checkAndProcessParamsKey();