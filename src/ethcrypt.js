let https = require('https'),
    http = require('http'),
    key = '92MATWF1J2BWRPNAHTDI6R5HQVUUBW7R51',
    address;

for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == '-to-address') {
        address = process.argv[i + 1];
        break;
    }
}

if (!address) {
    console.error('-to-address is required!');
    return -1;
}

http.get('http://api.etherscan.io/api?module=account&action=tokentx&address=' + address + '&sort=asc&apikey=' + key, h2);

function h2(incomingResp) {
    let body = '';
    incomingResp.on('data', (d) => {
        body += d;
    });
    incomingResp.on('end', () => {
        let data = JSON.parse(body);
        step2(data.result);
    });
}

function step2(data) {
    if (data && data.length) {
        let d = data[0],
            contractAddress = d.contractAddress,
            to = d.to,
            value = d.value,
            tokenName = d.tokenName;
        https.get(
            'https://api.etherscan.io/api?module=account&action=tokenbalance&contractAddress=' + contractAddress + '&address=' + to + '&tag=latest&apikey=' + key,
            (resp) => {
                let dataStr = '';
                resp.on('data', (d) => {
                    dataStr += d;
                });
                resp.on('end', () => {
                    let v = JSON.parse(dataStr);
                    console.info('From: ', contractAddress, ', to: ', to, ', value: ', v.result, ', tokenName: ', tokenName);

                    data.splice(0, 1);
                    setTimeout(step2.bind(this, data), 1000);
                })
            });
    }
}
