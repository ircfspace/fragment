const protocols = ["vless", "vmess", 'trojan'];

function parser(protocol, config) {
    if ( protocol === 'vmess' ) {
        config = base64Decode(config);
        config = Object.assign({
            'protocol': protocol,
        }, (config));
    }
    else if ( protocol === 'vless' || protocol === 'trojan' ) {
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
    $('#defConfig').trigger('keyup');
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
        alert('پروتکل باید VLESS/VMESS/TROJAN باشد!');
        resetForm();
        return false;
    }
    $('#protocol option').removeAttr('selected');
    $('#protocol option[value="'+protocol+'"]').attr('selected', 'selected').prop('selected', true);
    let defConfig = parser(protocol, config);
    console.log(defConfig)
    if ( protocol === 'vmess' && ["reality", "tcp"].includes(defConfig.tls) ) {
        alert('نوع کانفیگ باید WS/GRPC باشد!');
        resetForm();
        return false;
    }
    if ( protocol === 'vless' && ["reality", "tcp"].includes(defConfig.security) ) {
        alert('نوع کانفیگ باید WS/GRPC باشد!');
        resetForm();
        return false;
    }
    $('#stream option').removeAttr('selected');
    if ( protocol === 'vmess' ) {
        $('#stream option[value="'+ (defConfig.net === 'ws' ? 'ws' : 'grpc') +'"]').attr('selected', 'selected').prop('selected', true).trigger('change');
    }
    else {
        $('#stream option[value="'+ (defConfig.type === 'ws' ? 'ws' : 'grpc') +'"]').attr('selected', 'selected').prop('selected', true).trigger('change');
    }
    let port = String(getAddress(config)[1]).replace('/', '');
    $('#port').val(port);
    $('#sni').val(defConfig.host);
    if ( (protocol === 'vmess' && defConfig.tls === "tls") || (protocol === 'vless' && defConfig.security === "tls") || (protocol === 'trojan' && defConfig.security === "tls") ) {
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
        $('#length').val('1-3');
        $('#interval').val('5');
        if ( typeof defConfig.host === "undefined" || typeof defConfig.host !== "undefined" && defConfig.host === "") {
            $('#sni').val(defConfig.sni);
        }
    }
    if ( protocol === 'vmess' ) {
        $('#cleanIp').val(defConfig.add);
        $('#grpcMode option').removeAttr('selected');
        $('#grpcMode option[value="'+ (defConfig.type
        === 'multi' ? 'multi' : 'gun') +'"]').attr('selected', 'selected').prop('selected', true);
        if ( defConfig.net !== 'ws' ) {
            $('#serviceName').val(defConfig.path);
        }
    }
    else {
        $('#cleanIp').val(defConfig.address);
        $('#grpcMode option').removeAttr('selected');
        $('#grpcMode option[value="'+ (defConfig.mode === 'multi' ? 'multi' : 'gun') +'"]').attr('selected', 'selected').prop('selected', true);
        if ( defConfig.type !== 'ws' ) {
            $('#serviceName').val(defConfig.serviceName);
        }
    }
    if ( typeof defConfig.allowInsecure !== "undefined" ) {
        if ( protocol === 'vmess' ) {
            if ( defConfig.allowInsecure ) {
                $('#insecure').prop('checked', true);
            }
            else {
                $('#insecure').prop('checked', false);
            }
        }
        else {
            if ( defConfig.allowInsecure === "1" ) {
                $('#insecure').prop('checked', true);
            }
            else {
                $('#insecure').prop('checked', false);
            }
        }
    }
    else {
        if ( protocol === 'vmess' ) {
            if ( defConfig.tls !== "tls" ) {
                $('#insecure').prop('checked', true);
            }
            else {
                $('#insecure').prop('checked', false);
            }
        }
        else {
            if ( defConfig.security !== "tls" ) {
                $('#insecure').prop('checked', true);
            }
            else {
                $('#insecure').prop('checked', false);
            }
        }
    }
    let stream = $('#stream').val();
    if ( stream !== 'ws' ) {
        $('#early').prop('checked', false);
    }
    let path = setPath(protocol !== 'vmess' && defConfig.type === 'ws' || protocol === 'vmess' && defConfig.net === 'ws' ? defConfig.path : "");
    let early = $('#early').is(':checked');
    if ( early && stream === 'ws' ) {
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

$(document).on('change', '#stream', function(e) {
    let stream = $('#stream').val();
    if ( stream !== 'ws' ) {
        $('#grpcOnly').removeClass('none');
        $('#path').prop('disabled', true).val('');
        $('#early').prop('disabled', true);
    }
    else {
        $('#grpcOnly').addClass('none');
        $('#path').prop('disabled', false).val('');
        $('#early').prop('disabled', false);
    }
});

$(document).on('click', '#early', function(e) {
    let early = $('#early').is(':checked');
    let path = setPath($('#path').val());
    let stream = $('#stream').val();
    if ( early && stream === 'ws' ) {
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
        $('#length').val('1-3');
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

function generateJson() {
    return new Promise((resolve, reject) => {
        let protocol = $('#protocol').val();
        let stream = $('#stream').val();
        //let network = $('#network').val();
        let uuid = $('#uuid').val();
        let sni = cleanUrl($('#sni').val());
        let port = $('#port').val();
        let path = $('#path').val();
        let tls = $('#tls').is(':checked');
        let mux = $('#mux').is(':checked');
        let insecure = $('#insecure').is(':checked');
        let concurrency = $('#concurrency').val();
        let packets = $('#packets').val();
        let length = $('#length').val();
        let interval = $('#interval').val();
        //let early = $('#early').is(':checked');
        let grpcMode = $('#grpcMode').val();
        let serviceName = $('#serviceName').val();
        let cleanIp = $('#cleanIp').val();
        if ( cleanIp === '' ) {
            cleanIp = 'zula.ir';
        }
        let direct = $('#direct').is(':checked');
        let appName = $('input[name="app"]:checked').attr('id');
        if ( uuid === '' || sni === ''|| port === '' ) {
            alert('فرم را تکمیل نمایید.');
            return false;
        }
        fetch('fragment.json?v1.6')
            .then(response => response.json())
            .then(data => {
                if (appName === 'nekoray') {
                    data.inbounds[0].port = 2080;
                    data.inbounds[1].port = 2081;
                }
                else {
                    data.inbounds[0].port = 10808;
                    data.inbounds[1].port = 10809;
                }
                data.outbounds[0].protocol = protocol;
                if ( mux ) {
                    data.outbounds[0].mux.enabled = true;
                    data.outbounds[0].mux.concurrency = Number(concurrency);
                    data.outbounds[0].mux.xudpConcurrency = Number(concurrency);
                }
                else {
                    delete data.outbounds[0].mux;
                }
                data.outbounds[0].streamSettings.network = stream;
                if ( stream === "grpc" ) {
                    delete data.outbounds[0].streamSettings.wsSettings;
                    data.outbounds[0].streamSettings.grpcSettings.multiMode = (grpcMode === 'multi' ? true : false);
                    data.outbounds[0].streamSettings.grpcSettings.serviceName = serviceName;
                }
                else {
                    delete data.outbounds[0].streamSettings.grpcSettings;
                    data.outbounds[0].streamSettings.wsSettings.headers.Host = sni;
                    data.outbounds[0].streamSettings.wsSettings.path = path;
                }
                data.outbounds[0].streamSettings.tlsSettings.allowInsecure = (insecure ? true : false);
                data.outbounds[0].streamSettings.tlsSettings.serverName = sni;
                data.outbounds[1].settings.fragment.packets = packets;
                data.outbounds[1].settings.fragment.length = length;
                data.outbounds[1].settings.fragment.interval = interval;
                if ( protocol === 'trojan' ) {
                    data.outbounds[0].settings.servers[0].port = Number(port);
                    data.outbounds[0].settings.servers[0].password = uuid;
                    data.outbounds[0].settings.servers[0].address = cleanIp;
                    delete data.outbounds[0].settings.vnext;
                }
                else {
                    data.outbounds[0].settings.vnext[0].port = Number(port);
                    data.outbounds[0].settings.vnext[0].users[0].id = uuid;
                    data.outbounds[0].settings.vnext[0].address = cleanIp;
                    delete data.outbounds[0].settings.servers;
                }
                if ( tls ) {
                    data.outbounds[0].streamSettings.security = "tls";
                }
                else {
                    delete data.outbounds[0].streamSettings.tlsSettings;
                    delete data.outbounds[0].streamSettings.security;
                }
                if ( ! direct ) {
                    /*delete data.routing.rules[1];
                    delete data.routing.rules[2];*/
                    data.routing.rules = data.routing.rules.filter((rule, index) => index !== 1 && index !== 2);
                }
                resolve([
                    data,
                    'protocol*IRCF*'+protocol+
                    '&network*IRCF*'+stream+
                    '&uuid*IRCF*'+uuid+
                    '&sni*IRCF*'+sni+
                    '&port*IRCF*'+port+
                    '&path*IRCF*'+path?.replace('/?ed=2048', '/abcdz=2048')+
                    '&tls*IRCF*'+tls+
                    '&insecure*IRCF*'+insecure+
                    '&mux*IRCF*'+mux+
                    '&concurrency*IRCF*'+concurrency+
                    '&packets*IRCF*'+packets+
                    '&length*IRCF*'+length+
                    '&interval*IRCF*'+interval+
                    '&grpcMode*IRCF*'+grpcMode+
                    '&serviceName*IRCF*'+serviceName+
                    '&cleanIp*IRCF*'+cleanIp+
                    '&appName*IRCF*'+appName+
                    '&directRules*IRCF*'+direct
                ]);
            })
            .catch(error => {
                reject(error);
            });
    });
}

$(document).on('click', '#getFile', function(e) {
    e.preventDefault();
    generateJson()
        .then(data => {
            const jsonData = JSON.stringify(data[0], null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fragment [ircf.space].json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            // Handle errors here
            console.log(error)
        });
});

$(document).on('click', '#copyCode, #copyJsonFromQR', function (e) {
    e.preventDefault();
    generateJson()
        .then(data => {
            data = JSON.stringify(data[0], null, 2);
            document.getElementById("jsonOutput").value = data;
            const input = document.getElementById('jsonOutput');
            input.select();
            input.setSelectionRange(0, 99999);
            document.execCommand('copy');
            $("#qrModal").modal('hide');
            alert('کد در کلیپ‌بورد کپی شد.');
        })
        .catch(error => {
            console.error(error);
        });
});

let vercelUrl = 'https://irimmortal.vercel.app/json/prm/';

$(document).on('click', '#jsonUrl', function (e) {
    e.preventDefault();
    generateJson()
        .then(data => {
            window.open(vercelUrl+btoa(data[1]));
        })
        .catch(error => {
            console.error(error);
        });
});

$(document).on('click', '#qrGen', function (e) {
    e.preventDefault();
    generateJson()
        .then(data => {
            $('#qrcode img').attr('src', "https://quickchart.io/qr?size=300x200&light=ffffff&text="+encodeURIComponent(vercelUrl+btoa(data[1])))
            $('#qrcode input').val(vercelUrl+btoa(data[1]))
            $("#qrModal").modal('show');
        })
        .catch(error => {
            console.error(error);
        });
});

$(document).on('click', '#copyUrl', function (e) {
    e.preventDefault();
    generateJson()
        .then(data => {
            document.getElementById("jsonOutput").value = vercelUrl+btoa(data[1]);
            const input = document.getElementById('jsonOutput');
            input.select();
            input.setSelectionRange(0, 99999);
            document.execCommand('copy');
            $("#qrModal").modal('hide');
            alert('آدرس در کلیپ‌بورد کپی شد.');
        })
        .catch(error => {
            console.error(error);
        });
});

window.addEventListener('load', function() {
    $('[data-toggle="tooltip"]').tooltip({
        placement: "top",
        trigger: "hover",
    })
});

$(document).on('change', 'input[type="radio"][name="app"]', function(e) {
    e.preventDefault();
    console.log($(this).attr('id'))
    let direct = $('#direct').is(':checked');
    let napsternetV = document.getElementById('napsternetV').checked;
    if ( napsternetV && direct ) {
        $('#direct').trigger('click');
    }
});