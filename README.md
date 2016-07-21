# Lede
[![Build Status](https://travis-ci.org/tbtimes/ledeTwo.svg?branch=master)](https://travis-ci.org/tbtimes/ledeTwo)

Lede is a cross-platform build tool designed to make it simple for news organizations to build pretty story pages. Lede aims to be flexible enough that an experienced designer/developer can quickly throw together a non-traditional story page (like a media slider) but simple enough that non-developers (web editors) can build story pages from predefined pieces of functionality called bits and blocks. If your newsroom has developers, they can create new bits and blocks for use in any project.

__This project is under active development and is, at the moment, incomplete. Breaking changes are likely.__

## Owners manual
_This documentation assumes you are using a unix system for the terminal. If you are on windows, you can try [git for windows](https://git-for-windows.github.io/) or [cygwin](https://www.cygwin.com/) or just translate the bash syntax into windows cmd syntax._

Projects in Lede have a few parts. First is the Lede CLI which you will use to create a project. A project is a directory that contains that contains a file called `projectSettings.js` which holds configuration information for the project — more on that later. First, though, let's install Lede and get it working.

The first thing you'll need to run Lede is the latest stable version of Nodejs and npm. The simplest way to meet these requirements is by using [nvm](https://github.com/creationix/nvm) to manage your node versions (on windows use [this](https://github.com/coreybutler/nvm-windows)). Follow the installation instructions (or use the windows installer) to get nvm and then open a new terminal window. In that terminal, run the commands `nvm install stable` to install the latest version of node and npm (v6.3.0 as of this writing).

### Installing the CLI
_As of right now, the CLI is only available on github and requires a bit of manual work to install. In the future you'll be able to download and install it using npm._

With node installed, you are ready to install Lede.

Go ahead and clone this repo and then cd into it. From inside the root directory, run `npm install`. This will probably take a couple of minutes. After it has finished, run `npm run build && npm run install && npm link`. This command will build the source code, create a LedeProjects directory and install a package with core functionality, and then put the CLI binary on your path.

