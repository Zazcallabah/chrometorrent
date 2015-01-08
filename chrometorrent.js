function ChromeTorrent( log ) {

// Fields
	var self = this;
	var host = "";
	var host2 = "";
	var username = "";
	var password = "";
	var token = "";

// Private methods

	var resetForHost = function( hoststr, callback, errorcallback )
	{
		$.ajax( {
			url:      hoststr + "token.html",
			success:  callback,
			username: username,
			password: password,
			error: errorcallback
		});
	};
	var resetToken = function( callback ) {
		var handlecallback = function(data) {
			token = $(data).first().first().html();
			if( callback !== undefined )
				callback();
		};
		var errcallb = function( xhr,status,e){
				log.addError("when fetching api token. encountered " +status+e);
		};
		
		resetForHost( host, handlecallback, function(xhr,status,e){ resetForHost( host2, handlecallback, errcallb );});
	};
	
	var hasStorageChanged = function() {
		var reset = localStorage["reset"] !== undefined;
		if(reset)
			localStorage["reset"]=undefined;
		return reset || localStorage["host"] !== host || localStorage["host2"] !== host2 || localStorage["user"] !== username || localStorage["pass"] !== password;
	};

	var refetchStorage = function() {
		host = localStorage["host"];
		host2 = localStorage["host2"];
		username = localStorage["user"];
		password = localStorage["pass"];
	};
	
	var postTorrent = function(torrent,fresh) {
		var primaryUrl = self.createDownloadUrlForTorrent(self.getHost(),torrent);
		var secondaryUrl = self.createDownloadUrlForTorrent(self.getHost2(),torrent);
		$.ajax( {
			url:      primaryUrl,
			username: self.getUser(),
			password: self.getPassword(),
			error: function(xhr,status,e){ 
				$.ajax( {
					url:      secondaryUrl,
					username: self.getUser(),
					password: self.getPassword(),
					error: function(xhr,status,e){ 
						if( fresh )
							log.addError("when posting torrent. encountered "+status+e);
						else
						{
							refetchStorage();
							resetToken( function(){ postTorrent(torrentUrl,true) } );
						}
					},
					success: function(){}
				});
			},
			success: function(){}
		});

	};

// Public methods
	this.getUser = function() {
					return username;
	};
	this.getHost= function() {
					return host;
	};
	this.getHost2 = function() {
					return host2;
	};
	this.getPassword= function() {
					return password;
	};
	this.getToken = function() {
					return token;
	};
	
	this.createDownloadUrlForTorrent =  function (host,url) {
		return host + "?token=" + self.getToken() + "&action=add-url&s=" + escape(url);
	};

	this.addTorrent = function(torrentUrl) {
		if( !hasStorageChanged() ) {
			postTorrent(torrentUrl);
			return;
		}

		//slow way, redo token thing
		refetchStorage();
		resetToken( function(){ postTorrent(torrentUrl,true) } );
	};
}

function makeLog() {
	var maxEntries = 100;
	var loglabel = "logdata";
	var saveLog = function( log ){
		localStorage[loglabel] = JSON.stringify(log);
	};

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
			var log = this.get();
			log[log.length] = row;
			saveLog( ensureNotExceedingMax( log ) );
		},
		get: function() {
			var storedlog = localStorage[loglabel];
			if( storedlog === undefined || storedlog === null || storedlog === "" )
				return [];
			return JSON.parse( storedlog )
		}
	};
};

var myLog = makeLog();
var myTorrent = new ChromeTorrent( myLog );

function linkify( url ) {
	return "<a href=\""+url+"\">"+url+"</a>";
};

function download(info, tab) {

  myTorrent.addTorrent(info.linkUrl);
  console.log("item " + info.linkUrl + " was clicked");
  myLog.addInfo( "clicked: " + linkify(info.linkUrl) );

  }

  var title = "Send to uTorrent";
  var id = chrome.contextMenus.create({"title": title, "contexts":["link"], "onclick": download});
  