# Lede
[![Build Status](https://travis-ci.org/tbtimes/ledeTwo.svg?branch=master)](https://travis-ci.org/tbtimes/ledeTwo)

Lede is a cross-platform build tool designed to make it simple for news organizations to build pretty story pages. Lede aims to be flexible enough that an experienced designer/developer can quickly throw together a non-traditional story page (like a media slider) but simple enough that non-developers (reporters and web editors) can build story pages from predefined pieces of functionality called bits and blocks. If your newsroom has developers, they can create new bits and blocks for use in any project.

__This project is under active development and is, at the moment, incomplete. Breaking changes are likely.__

## Owners manual
_This documentation assumes you are using a unix system for the terminal. If you are on windows, you can try [git for windows](https://git-for-windows.github.io/) or [cygwin](https://www.cygwin.com/) or just translate the bash syntax into windows cmd syntax._

Projects in Lede have a few parts. First is the Lede CLI which you will use to create a project. A project is a directory that contains that contains a file called `projectSettings.js` which holds configuration information for the project — more on that later. First, though, let's install Lede and get it working.

The first thing you'll need to run Lede is the latest stable version of Nodejs and npm. The simplest way to meet these requirements is by using [nvm](https://github.com/creationix/nvm) to manage your node versions (on windows use [this](https://github.com/coreybutler/nvm-windows)). Follow the installation instructions (or use the windows installer) to get nvm and then open a new terminal window. In that terminal, run the commands `nvm install stable` to install the latest version of node and npm (v6.3.0 as of this writing).

### Installing the CLI
_As of right now, the CLI is only available on github and requires a bit of manual work to install. In the future you'll be able to download and install it using npm._

With node installed, you are ready to install Lede.

Go ahead and clone this repo and then cd into it. From inside the root directory, run `npm install`. This will probably take a couple of minutes. After it has finished, run `npm run build && npm run install && npm link`. This command will build the source code, create a LedeProjects directory in your home directory and install a package with core functionality, and then put the CLI binary on your path. If you don't want Lede to set up LedeProjects in your home directory, you can set the environment variable LEDE_HOME to either an absolute path or a path relative to your home directory and rerun `npm run install`.

### Using the CLI
The Lede CLI exposes a few commands to help you create, test, and deploy Lede projects.

* `lede new project <name>` will scaffold a new project and put it in your LedeProjects directory (or wherever LEDE_HOME points to)
* `lede dev` from inside a project directory will serve your current project.
* `lede ls` will list all projects.
* `lede cd <name>` will return the path of project <name>. You can use it with cd to change directly into a project (``cd `lede cd <name>` ``)

### Anatomy of a project
A project in Lede is a collection of files that work together to create a single page.

###### Directory structure
* \<projectname\>
    * assets
    * bits
    * blocks
    * scripts
    * styles
    * baseContext.js
    * projectSettings.js

###### assets directory
The assets directory is where you store any assets that aren't stylesheets or javascript such as images or json that you will load with ajax.

###### bits
The bits directory stores bits which are reusable pieces of functionality that can be carried from project to project. Bits have a special integration with googledocs. Read more about bits in the section [Anatomy of a bit](#anatomy-of-a-bit).

###### blocks
The blocks directory contains chunks of html (blocks) that can be reused across projects. Headers, footers, sidebars are excellent candidates for blocks. By default, Lede expects blocks to be written using the [Nunjucks templating language](https://mozilla.github.io/nunjucks/). Nunjucks is a javascript port of Jinja so Django users should feel write at home writing templates.

###### scripts
Scripts you want on the page should be kept in the scripts directory. By default, all scripts are run through babel and browserify before being served so they can be written in es6.

###### styles
Global stylesheets are stored in the styles directory. By default, Lede expects stylesheets to be written in Sass and will transpile them to css before being served.

###### baseContext.js
baseContext.js allows you to set values that will be injected into the context when Lede renders the Nunjucks templates.

###### projectSettings.js
projectSettings.js holds configuration information for a project. We will dive more indepth into projectSettings in a minute, but first you should know about inheritance.

#### Inheritance
A project tktktktktktktktkt