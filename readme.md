## Install instructions

### Chrome

Because chrome doesnt allow self published extensions without displaying a nagbox.

1. Open `gpedit.msc`
2. navigate to `User Configuration` > `Administrative Templates` > `Google` > `Extensions`
3. Enable `Configure extension installation whitelist`
4. Add the following id to the white list in the options: `ilnijhbknbbiopiidgajkbnipdgpilbb`
5. Drag the chrometorrent.crx file found in this repo to the chrome extensions settings page.

### Firefox

[ChromeTorrent on addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/chrometorrent/)


## Server
You need to provide your own server. Enter server details into the options page of the extension.
Server api must accept basic auth. For qbt-nox this means you will have to reverse proxy the original api, and use whitelist to allow the reverse proxy through.


## version history

0.6 - switch from utorrent-based api to qbittorrent-nox-based api
