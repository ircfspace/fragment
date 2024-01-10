function randomizeCase(inputString) {
    let resultString = '';
    for (let i = 0; i < inputString.length; i++) {
        const randomCase = Math.random() < 0.5 ? 'toLowerCase' : 'toUpperCase';
        resultString += inputString[i][randomCase]();
    }
    return resultString;
}

function cleanUrl(url) {
    const trimmedUrl = url.replace(/\/+$/, '');
    const withoutProtocol = trimmedUrl.replace(/^https?:\/\//, '');
    const finalUrl = withoutProtocol.trim();
    return randomizeCase(finalUrl);
}

$(document).on('click', '#getFile', function(e) {
    e.preventDefault();
    let protocol = $('#protocol').val();
    let network = $('#network').val();
    let uuid = $('#uuid').val();
    let sni = cleanUrl($('#sni').val());
    let port = $('#port').val();
    let path = $('#path').val();
    if ( path.length > 0 ) {
        if (!path.startsWith("/")) {
            path = '/'+path;
        }
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }
    }
    let tls = $('#tls').val();
    let early = $('#early').val();
    let cleanIp = $('#cleanIp').val();
    if ( cleanIp === '' ) {
        cleanIp = 'zula.ir';
    }
    if ( uuid === '' || sni === ''|| port === '' ) {
        alert('فرم را تکمیل نمایید.');
        return;
    }
    fetch('fragment.json?v1.0')
        .then(response => response.json())
        .then(data => {
            data.outbounds[0].protocol = protocol;
            data.outbounds[0].streamSettings.network = network;
            data.outbounds[0].streamSettings.tlsSettings.serverName = sni;
            data.outbounds[0].streamSettings.wsSettings.headers.Host = sni;
            if ( early === 'on' ) {
                data.outbounds[0].streamSettings.wsSettings.path = path+'/?ed=2048';
            }
            else {
                data.outbounds[0].streamSettings.wsSettings.path = path;
            }
            data.outbounds[0].settings.vnext[0].port = Number(port);
            data.outbounds[0].settings.vnext[0].users[0].id = uuid;
            data.outbounds[0].settings.vnext[0].address = cleanIp;
            data.outbounds[0].streamSettings.security = tls;
            if ( tls === 'tls' ) {
                data.outbounds[1].settings.fragment.packets = 'tlshello';
                data.outbounds[1].settings.fragment.length = '10-20';
                data.outbounds[1].settings.fragment.interval = '10-20';
            }
            else {
                data.outbounds[1].settings.fragment.packets = '1-1';
                data.outbounds[1].settings.fragment.length = '3-5';
                data.outbounds[1].settings.fragment.interval = '5';
                delete data.outbounds[0].streamSettings.tlsSettings;
            }
            //console.log(data)
            downloadJsonFile(data, 'fragment [ircf.space].json');
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
});

function downloadJsonFile(data, filename) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}