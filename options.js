
function saveOptions(e) {
	e.preventDefault();
	browser.storage.local.set({
		host: document.querySelector("#host").value,
		host2: document.querySelector("#host2").value,
		username: document.querySelector("#username").value,
		password: document.querySelector("#password").value
	});
}

function restoreOptions() {
	browser.storage.local.
		get(["host","host2","username","password"]).
		then(function(result){
			document.querySelector("#host").value = result.host || "";
			document.querySelector("#host2").value = result.host2 || "";
			document.querySelector("#username").value = result.username || "";
			document.querySelector("#password").value = result.password || "";
		}, function onError(error) {
			console.log(`Error: ${error}`);
		});
	document.getElementById('refresh_log').addEventListener('click', refresh_log);
	document.getElementById('clear_log').addEventListener('click', clear_log);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form#settings").addEventListener("submit", saveOptions);

function refresh_log() {
	browser.storage.local.get(["log"]).
		then(function(result){
			var log = result.log;

			var logdiv = document.getElementById("log");
			logdiv.innerHTML = "";
			if( log !== undefined ){
				for( var label in log ){
					if( log.hasOwnProperty(label) ) {
						logdiv.innerHTML += "<p>"+log[label]+"</p>";
					}
				}
			}
		});
}

function reset_token() {
	browser.storage.local.set({ reset: "true" });
}

function clear_log() {
	document.getElementById("log").innerHTML = "";
	browser.storage.local.set({ log: "" });
}
