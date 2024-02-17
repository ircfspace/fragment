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

$(document).on('click', '#checkConf', function(e) {
    $('#defConfig').trigger('keyup')
});

function resetForm() {
    $('#protocol option').removeAttr('selected');
    $('#tls').prop('checked', true);
    $('#early').prop('checked', false);
    $('#uuid').val("");
    $('#port').val("");
    $('#sni').val("");
    $('#cleanIp').val("");
    $('#path').val("");
    $('#concurrency').val("");
    $('#packets').val('tlshello');
    $('#length').val('10-20');
    $('#interval').val('10-20');
}

$(document).on('keyup', '#defConfig', function(e) {
    e.preventDefault();
    let config = $(this).val().trim();
    if ( config === '' ) {
        //console.clear();
        resetForm();
        return false;
    }
    let protocol = getProtocol(config);
    if ( ! protocols.includes(protocol) ) {
        alert('پروتکل باید Vless یا Vmess باشد!');
        resetForm();
        return false;
    }
    $('#protocol option').removeAttr('selected');
    $('#protocol option[value="'+protocol+'"]').attr('selected', 'selected');
    let defConfig = parser(protocol, config);
    if ( protocol === 'vmess' && ["grpc", "reality", "tcp", "quic"].includes(defConfig.tls) ) {
        alert('نوع کانفیگ باید وب‌سوکت باشد!');
        resetForm();
        return false;
    }
    if ( protocol === 'vless' && ["grpc", "reality", "tcp", "quic"].includes(defConfig.security) ) {
        alert('نوع کانفیگ باید وب‌سوکت باشد!');
        resetForm();
        return false;
    }
    let port = String(getAddress(config)[1]).replace('/', '');
    $('#port').val(port);
    $('#sni').val(defConfig.host);
    if ( (protocol === 'vmess' && defConfig.tls === "tls") || (protocol === 'vless' && defConfig.security === "tls") ) {
        $('#tls').prop('checked', true);
        $('#packets').val('tlshello');
        $('#length').val('10-20');
        $('#interval').val('10-20');
        if ( typeof defConfig.host === "undefined" || typeof defConfig.host !== "undefined" && defConfig.host === "") {
            $('#sni').val(defConfig.sni);
        }
    }
    else {
        $('#tls').prop('checked', false);
        $('#packets').val('1-1');
        $('#length').val('3-5');
        $('#interval').val('5');
    }
    if ( protocol === 'vmess' ) {
        $('#cleanIp').val(defConfig.add);
    }
    else {
        $('#cleanIp').val(defConfig.address);
    }
    let path = setPath(defConfig.path);
    let early = $('#early').is(':checked');
    if ( early ) {
        path = path+'?ed=2048';
    }
    $('#uuid').val(getHashId(defConfig.id));
    $('#path').val(path);
});

function setPath(string) {
    if ( typeof string === "undefined" ) {
        string = "";
    }
    if ( string.length > 0 ) {
        string = string.replace('?ed=2048', '');
        /*if (!string.startsWith("/")) {
            string = '/'+string;
        }*/
        /*if (string.endsWith("/")) {
            string = string.substring(0, string.length - 1);
        }*/
        string = string.replace('//', '/');
    }
    return string;
}

$(document).on('click', '#early', function(e) {
    let early = $('#early').is(':checked');
    let path = setPath($('#path').val());
    if ( early ) {
        path = path+'?ed=2048';
    }
    $('#path').val(path);
});

$(document).on('click', '#tls', function(e) {
    let tls = $('#tls').is(':checked');
    if ( tls ) {
        $('#packets').val('tlshello');
        $('#length').val('10-20');
        $('#interval').val('10-20');
        $('#sni').attr('placeholder', 'SNI');
    }
    else {
        $('#packets').val('1-1');
        $('#length').val('3-5');
        $('#interval').val('5');
        $('#sni').attr('placeholder', 'Host');
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
    let path = setPath($('#path').val());
    let tls = $('#tls').is(':checked');
    let mux = $('#mux').is(':checked');
    let concurrency = $('#concurrency').val();
    let packets = $('#packets').val();
    let length = $('#length').val();
    let interval = $('#interval').val();
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
            data.outbounds[1].settings.fragment.packets = packets;
            data.outbounds[1].settings.fragment.length = length;
            data.outbounds[1].settings.fragment.interval = interval;
            if ( tls ) {
                data.outbounds[0].streamSettings.security = "tls";
            }
            else {
                delete data.outbounds[0].streamSettings.tlsSettings;
                delete data.outbounds[0].streamSettings.security;
            }
            //console.log(data)
            $.ajax({
                url: 'https://pastes.io/api/paste/create',
                type: 'POST',
                dataType: 'json',
                data: {
                    content: data,
                    status: '1',
                    expire: 'N',
                    title: 'fragment',
                    syntax: 'none',
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer 797a51c84a75ea799ad02b0977e31a3147d2325573add6440845d33387944cfb'
                },
                success: function (response) {
                    console.log(response);
                },
                error: function (xhr, status, error) {
                    console.error(error);
                }
            });
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