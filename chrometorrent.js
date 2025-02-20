function makeLog() {
  var maxEntries = 100;

  var getTime = function () {
    var t = new Date();
    return t.toISOString();
  };

  var ensureNotExceedingMax = function (log) {
    if (log.length > maxEntries) {
      log.splice(0, log.length - maxEntries);
    }
    return log;
  };
  return {
    addInfo: function (row) {
      this.add(getTime() + " INFO: " + row);
    },
    addError: function (row) {
      this.add(getTime() + " ERROR: " + row);
    },
    add: function (row) {
      browser.storage.local.get("log").then(
        function (result) {
          var log = [];
          if (result && result.log && result.log != "") log = result.log;
          log[log.length] = row;
          browser.storage.local.set({ log: ensureNotExceedingMax(log) });
        },
        function (error) {
          console.log(error);
        }
      );
    },
  };
}

var myLog = makeLog();

const urlEndpoint = (host, endpoint) => {
  return `${host.trimEnd("/")}/${endpoint}`;
};

const qbitDownload = async (url, host, user, pass) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");
  headers.append("Authorization", "Basic " + btoa(user + ":" + pass));
  const data = new FormData();
  data.append("urls", url);
  const result = await fetch(urlEndpoint(host, "api/v2/torrents/add"), {
    credentials: "include",
    method: "POST",
    headers,
    body: new URLSearchParams(data),
    referrer: host,
  });
  return result.ok;
};

const linkify = (url) => {
  return '<a href="' + url + '">' + url + "</a>";
};

const download = async (info, tab) => {
  console.log("item " + info.linkUrl + " was clicked");
  const result = await browser.storage.local.get([
    "host",
    "username",
    "password",
  ]);
  const success = await qbitDownload(
    info.linkUrl,
    result.host,
    result.username,
    result.password
  );
  myLog.addInfo(
    `clicked: ${linkify(info.linkUrl)} (${success ? "ok" : "fail"})`
  );
};

const title = "Send to uTorrent";
const id = chrome.contextMenus.create({
  title: title,
  contexts: ["link"],
  onclick: download,
});
