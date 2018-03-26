const urlParser = document.createElement('a');
const baiduSearchUrl = 'https://www.baidu.com/s?wd=';


function sendRequest(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            } else {
                alert("请求发生错误 ", xhr.statusText);  
            }
        }
    }
    xhr.send();
}

function isURLIncluded(url, callback) {
    urlParser.href = url;
    sendRequest(baiduSearchUrl + url, (body) => {
        let parser = new DOMParser(), doc = parser.parseFromString(body, "text/html");
        let firstBlock = doc.getElementById('1');
        let emptyBlock = null;
        if(doc.getElementById('container')) {
             let emptyBlock = doc.getElementById('container').getElementsByTagName('content_none');
        }
        if(firstBlock) {
            let firstLinkF3 = firstBlock.getElementsByClassName('f13')[0];
            let firstLinkText = firstLinkF3.getElementsByTagName('a')[0].innerText;
            // 三个.加一个空格
            firstLinkText = firstLinkText.split('...')[0];
            // 域名开头
            // 带protocol
            if(url.substr(0, firstLinkText.length) === firstLinkText) {
                callback(true);
                return;
            }
            let protocol = urlParser.protocol + "//";
            let articleUrlNoProtocol = url.substr(protocol.length);
            callback(articleUrlNoProtocol.substr(0, firstLinkText.length) === firstLinkText)
        } else if(emptyBlock) {
            return false;
        } else {
            throw new Error('访问频率过快');
        }
    });
}

document.getElementById('btn-search-include').onclick = function () {
    try {
        let input = document.getElementById('input-link-include');
        if(!input) {
            alert('请输入url');
        } else {
            isURLIncluded(input.value, (res) => {
                document.getElementById('include-result').innerText = res ? '收录' : '未收录'
            })
        }
    } catch(err) {
        alert(err.message)
    }
}

