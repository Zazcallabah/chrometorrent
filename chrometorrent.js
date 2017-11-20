
function ajax(url, verb, user, pass, callback)
{
	var httpRequest = new XMLHttpRequest();
	function handleResponse() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				if(callback)
					callback(httpRequest.responseText);
			} else {
				console.error(httpRequest)
			}
		}
	}

	httpRequest.onreadystatechange = handleResponse;
	httpRequest.open(verb,url);
	if( user && pass )
		httpRequest.setRequestHeader("Authorization", "Basic " + btoa(user+":"+pass));
	httpRequest.send();
}

function extractToken(str)
{
	var r = /<html><div[^>]*>([^<]+)/
	var result = r.exec(str);
	if( result && result.length > 1 )
		return result[1];
	return null;
}

function createDownloadUrlForTorrent(url,host,token) {
	return host + "/gui/?token=" + token + "&action=add-url&s=" + escape(url);
};

function send(url,host,token){
	var href = createDownloadUrlForTorrent(url,host,token);
	ajax(href,"GET");
}

function makeLog() {
	var maxEntries = 100;

	var getTime= function(){
		var t = new Date();
		return t.toISOString()
	};

	var ensureNotExceedingMax = function( log ){
		if( log.length > maxEntries ) {
			log.splice(0,log.length - maxEntries);
		}
		return log;
	};
	return {
		addInfo: function( row ){
			this.add( getTime() + " INFO: "+row );
		},
		addError: function(row){
			this.add(getTime() + " ERROR: "+row);
		},
		add: function( row ) {
			browser.storage.local.get("log").then(function(result){
				var log = [];
				if( result && result.log && result.log != "" )
					log=result.log;
				log[log.length] = row;
				browser.storage.local.set({ log: ensureNotExceedingMax( log ) });
			},function(error){console.log(error)});
		}
	};
};

var myLog = makeLog();

function linkify( url ) {
	return "<a href=\""+url+"\">"+url+"</a>";
};

function download(info, tab) {

	
	console.log("item " + info.linkUrl + " was clicked");
	
	browser.storage.local.get(["host","host2","username","password"]).then(function(result){
		ajax(result.host+"/gui/token.html","GET",result.username,result.password,function(data){
			var token = extractToken(data);
			if( token )
			{
				send( info.linkUrl, result.host, token );
			}
			else
			{
				ajax(result.host2+"/gui/token.html","GET",result.username,result.password,function(data){
					var token = extractToken(data);
					if( token )
					{
						send( info.linkUrl, result.host2, token );
					}
					else console.error("no valid host");
				});
			}
		});
	});
	myLog.addInfo( "clicked: " + linkify(info.linkUrl) );

}

var title = "Send to uTorrent";
var id = chrome.contextMenus.create({"title": title, "contexts":["link"], "onclick": download});
