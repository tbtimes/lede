# emurray-develop branch
This branch is a starting point for the 4.0 release of lede.

### Issues to tackle for 4.0:
* Better filesystem watching for nix and windows (currently investigating facebook's [watchman](https://facebook.github.io/watchman/))
* Simpler config files (remove the class cruft and make config files export POJOS)
* Smarter state management (investigating [rxdb](https://github.com/pubkey/rxdb))
* Restructure lede as client-server architecture (core becomes server, CLI becomes client that connects to server)
* Flesh out lede modules system (look into using npm instead of running our own repository)
* Write. Tests.

### Issues to consider for future releases:
* Make a GUI for client with electron.
* Source maps for Martin 😎