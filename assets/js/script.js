const protocols = ["vless", "vmess"];
const ports = ["443", "2053", "2083", "2087", "2096", "8443"];

function parser(protocol, config) {
    if ( protocol === 'vmess' ) {
        config = base64Decode(config);
        config = Object.assign({
            'protocol': protocol,
        }, (config));
    }
    else if ( protocol === 'vless' ) {
        config = Object.assign({
            'protocol': protocol,
            'id': getHashId(config),
            'address': getAddress(config)[0],
            'port': getAddress(config)[1],
        }, parseQuery(config));
    }
    return config;
}

function parseQuery(config) {
    let query = {};
    let protocol = getProtocol(config);
    if ( protocol === 'vmess' ) {
        query = base64Decode(config);
    }
    else {
        let string = config.split("?");
        if ( typeof string[1] !== 'undefined' ) {
            string = string[1].split("#");
            if ( typeof string[0] !== 'undefined' ) {
                let pairs = string[0].split('&');
                for (let i = 0; i < pairs.length; i++) {
                    let pair = pairs[i].split('=');
                    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
                }
                if ( typeof string[1] !== 'undefined' ) {
                    query['remark'] = decodeURIComponent(string[1]);
                }
            }
        }
    }
    return query;
}

function getProtocol(config) {
    let string = config.split("://");
    if ( typeof string[0] !== 'undefined' ) {
        return string[0];
    }
    return '';
}

function getHashId(config) {
    let string = config.split("@");
    if ( typeof string[0] !== 'undefined' ) {
        let protocol = getProtocol(config);
        return string[0].replace(protocol+"://", "");
    }
    return '';
}

function getAddress(config) {
    let protocol = getProtocol(config);
    if ( protocol === 'vmess' ) {
        config = base64Decode(config);
        return [
            config.add,
            String(config.port),
        ]
    }
    else {
        let string = config.split("@");
        if ( typeof string[1] !== 'undefined' ) {
            string = string[1].split("?");
            if ( typeof string[0] !== 'undefined' ) {
                string = string[0].split(":");
                if ( typeof string[0] !== 'undefined' && typeof string[1] !== 'undefined' ) {
                    return [
                        string[0],
                        string[1].split("#")[0],
                    ]
                }
            }
        }
    }
    return ['', ''];
}

function base64Decode(config) {
    try {
        config = config.replace("vmess://", "");
        return JSON.parse(atob(config));
    }
    catch {
        return {};
    }
}

$(document).on('keyup', '#defConfig', function(e) {
    e.preventDefault();
    let config = $(this).val().trim();
    if ( config === '' ) {
        console.clear();
        $('#protocol option').removeAttr('selected');
        $('#tls').prop('checked', true);
        $('#early').prop('checked', true);
        $('#uuid').val("");
        $('#port').val("");
        $('#sni').val("");
        $('#cleanIp').val("");
        $('#path').val("");
        $('#concurrency').val("");
        $('#packets').val('tlshello');
        $('#length').val('10-20');
        $('#interval').val('10-20');
        return false;
    }
    let protocol = getProtocol(config);
    $('#protocol option').removeAttr('selected');
    $('#protocol option[value="'+protocol+'"]').attr('selected', 'selected');
    /*if ( ! protocols.includes(protocol) ) {
        return false;
    }*/
    $('#uuid').val(getHashId(config));
    $('#port').val(getAddress(config)[1]);
    let defConfig = parser(protocol, config);
    if ( (protocol === 'vmess' && defConfig.tls === "tls") || (protocol === 'vless' && defConfig.security === "tls") ) {
        $('#tls').prop('checked', true);
        $('#packets').val('tlshello');
        $('#length').val('10-20');
        $('#interval').val('10-20');
    }
    else {
        $('#tls').prop('checked', false);
        $('#packets').val('1-1');
        $('#length').val('3-5');
        $('#interval').val('5');
    }
    $('#sni').val(defConfig.host);
    if ( protocol === 'vmess' ) {
        $('#cleanIp').val(defConfig.add);
    }
    else {
        $('#cleanIp').val(defConfig.address);
    }
    let path = defConfig.path;
    let early = $('#early').is(':checked');
    if ( early ) {
        path = path+'/?ed=2048';
        path = path.replace('//', '/');
    }
    else {
        path = path.replace('/?ed=2048', '')
    }
    $('#path').val(path);
});

$(document).on('click', '#early', function(e) {
    let early = $('#early').is(':checked');
    let path = $('#path').val();
    if ( !early ) {
        $('#path').val(path.replace('/?ed=2048', ''));
    }
    else {
        path = path+'/?ed=2048';
        path = path.replace('//', '/');
        $('#path').val(path);
    }
});

$(document).on('click', '#tls', function(e) {
    let tls = $('#tls').is(':checked');
    if ( tls ) {
        $('#packets').val('tlshello');
        $('#length').val('10-20');
        $('#interval').val('10-20');
    }
    else {
        $('#packets').val('1-1');
        $('#length').val('3-5');
        $('#interval').val('5');
    }
});

$(document).on('click', '#mux', function(e) {
    let mux = $('#mux').is(':checked');
    if ( mux ) {
        $('#concurrency').val('8');
        $('#muxForm').removeClass('none');
    }
    else {
        $('#concurrency').val('');
        $('#muxForm').addClass('none');
    }
});

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
    //let network = $('#network').val();
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
        path = path.replace('//', '/');
    }
    let tls = $('#tls').is(':checked');
    let mux = $('#mux').is(':checked');
    let concurrency = $('#concurrency').val();
    //let early = $('#early').is(':checked');
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
            if ( mux ) {
                data.outbounds[0].mux.enabled = true;
                data.outbounds[0].mux.concurrency = Number(concurrency);
            }
            else {
                data.outbounds[0].mux.enabled = false;
                data.outbounds[0].mux.concurrency = Number(-1);
            }
            data.outbounds[0].streamSettings.network = "ws";
            data.outbounds[0].streamSettings.tlsSettings.serverName = sni;
            data.outbounds[0].streamSettings.wsSettings.headers.Host = sni;
            data.outbounds[0].streamSettings.wsSettings.path = path;
            data.outbounds[0].settings.vnext[0].port = Number(port);
            data.outbounds[0].settings.vnext[0].users[0].id = uuid;
            data.outbounds[0].settings.vnext[0].address = cleanIp;

            if ( tls ) {
                data.outbounds[1].settings.fragment.packets = 'tlshello';
                data.outbounds[1].settings.fragment.length = '10-20';
                data.outbounds[1].settings.fragment.interval = '10-20';
                data.outbounds[0].streamSettings.security = "tls";
            }
            else {
                data.outbounds[1].settings.fragment.packets = '1-1';
                data.outbounds[1].settings.fragment.length = '3-5';
                data.outbounds[1].settings.fragment.interval = '5';
                delete data.outbounds[0].streamSettings.tlsSettings;
                delete data.outbounds[0].streamSettings.security;
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