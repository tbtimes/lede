# Lede
[![Build Status](https://travis-ci.org/tbtimes/lede.svg?branch=master)](https://travis-ci.org/tbtimes/lede) [![Coverage Status](https://coveralls.io/repos/github/tbtimes/lede/badge.svg?branch=master)](https://coveralls.io/github/tbtimes/lede?branch=master)

Lede is a cross-platform build tool designed to make it simple for news organizations to build pretty story pages. Lede aims to be flexible enough that an experienced designer/developer can quickly throw together a non-traditional story page (like a media slider) but simple enough that non-developers (reporters and web editors) can build story pages from predefined pieces of functionality called bits and blocks. If your newsroom has developers, they can create new bits and blocks for use in any project.

For an easy-to-use command line tool, check out [lede-cli](http://github.com/tbtimes/lede-cli).

__This project is under active development and is, at the moment, incomplete. There may yet be breaking changes before the 1.0.0 release. You can see the design document [here](https://docs.google.com/document/d/1JWlMWI_K7AmLP4jQMzumpTnsQtkIrpMrVWLloAv-M20/edit?usp=sharing).__

## Installation
1. Install [nvm](https://github.com/creationix/nvm) [\[windows\]](https://github.com/coreybutler/nvm-windows) and the latest versions of node (v6.3.x) and npm (v3.x).
2. Create a [GitHub auth token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) and add the environment variable `GH_TOKEN=<your token>`.
3. Ask Eli Murray for the Google APIs auth token and set it to the environment variable `GAPI_KEY=<google auth token>`.
4. Install the cli with `npm install -g lede-cli`.
5. Install bunyan for pretty printing lede logs (`npm install -g bunyan`).

### Technical overview
There are four key concepts to understanding how lede works:
* The Dependency Assembler
* The Cache Builder
* Compilers
* Deployers

There's also a [Lede](./src/lede/Lede.ts) class which simply provides a wrapper around the four components with methods for doing common tasks.

#### Dependency Assembler
Lede has a concept of project inheritance which allows the user to inherit components from other projects. The [Dependency Assembler](./src/lede/DependencyAssembler.ts) is in charge of managing the inheritance chain. It returns a promise wrapped [Project Report](./src/interfaces/ProjectReport.ts) which is the central data structure in a lede project. 

The Project Report specifies the working directory of the current project, an array of every project the current project inherits from, a context object used to build the html, and a few various arrays that specify paths to resources which should be included on the page.

#### Cache Builder
The [Cache Builder](./src/lede/CacheBuilder.ts) takes a Project Report and caches all of the dependencies' resources in the current project's working directory. The cache structure gives lede it's "magic" where projects can import scripts, styles, and html templates from other projects. Compile a lede project and look inside `.ledeCache` to see how it's laid out.

#### Compilers
The compilers are the workhorse of a lede project. Each lede project has three compilers, an html compiler, a css compiler, and a js compiler. 

The html compiler is the root compiler with a `compile` method that takes a Project Report and an object containing the css and js compilers. The `compile` method returns a promise wrapped [Compiled Page](./src/interfaces/CompiledPage.ts). 

The html compiler uses the project report to create an array of bits that are included in the project; it then passes the project report and that array of used bits to the other two compilers' `compile` method. Each of those methods return a promise wrapped object with two properties, bits and globals, each containing a string of the compiled styles/scripts.

Lede's default compilers are Nunjucks for html, Sass for css, and Es6 for javascript but you can easily swap them out for custom built compilers that conform to the spec, keeping in mind that one set of compilers must work for every project in the inheritance chain (ie: no ElmCompiler for a project that inherits ES6 scripts.)

Compilers are specified in the current project inside `compilerConfig.js`. At the most basic level, compiler config should export an object with `compilers.html`, `compilers.css`, and `compilers.js` properties which implement the html, css, and js compiler spec described above. TODO: make these interfaces and link to them here. 

For an example `compilerConfig.js`, check out [the lede-cli project](https://github.com/tbtimes/lede-cli/blob/master/templates/project/compilerConfig.js).

#### Deployers
Deployers are the simplest component, they are responsible for turning a [Compiled Page](./src/interfaces/CompiledPage.ts) into a set of files and deploying those files. The most basic deployer, [File System Deployer](./src/deployers/FileSystemDeployer.ts), simply serializes the Compiled Page into files on the users' system where it can be served up by a local web server (check out [lede-cli](https://github.com/tbtimes/lede-cli) for a dev server). The [S3 Deployer](./src/deployers/S3Deployer.ts) subclasses the File System Deployer and ships the compiled files to Amazon S3 to host the page.