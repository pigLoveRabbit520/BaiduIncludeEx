const urlParser = document.createElement('a');
const baiduSearchUrl = 'https://www.baidu.com/s?wd=';
let currentUrl = '';



function sendRequest(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            } else {
                alert("请求发生错误 ", xhr.statusText);  
            }
        }
    };
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
            firstLinkText = firstLinkText.split('...')[0].trim();
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
            throw '访问频率过快';
        }
    });
}

function isSearchEngineHost(hostname) {
    if(/^[\w\d]+\.baidu.com/.test(hostname)) {
        return true;
    }
    if(/^[\w\d]+\.google.com/.test(hostname)) {
        return true;
    }
    return false;
}

chrome.history.onVisited.addListener(function(result) {
	try {
	    if(result.url) {
	    	urlParser.href = result.url;
	    	// 剔去百度，google域名
	    	if(!isSearchEngineHost(urlParser.hostname)) {
                currentUrl = result.url;
                isURLIncluded(result.url, (res) => {
                    let image = 'images/' + (res ? 'success.png' : 'fail.png');
                    chrome.browserAction.setIcon({path: image});
                })
            } else {
                chrome.browserAction.setIcon({path: 'images/icon38.png'});
            }
	    }
	} catch(err) {
		chrome.browserAction.setIcon({path: 'images/icon38.png'});
	    console.log(err.message)
	}
});

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({url: baiduSearchUrl + currentUrl, active: true})
});