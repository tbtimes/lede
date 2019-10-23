# Lede
Make pretty story pages

## Documentation
Lede is a static page build tool designed to make it relatively simple create pretty web pages. Lede uses two special ingredients to hasten page design – it comes with a command line interface, or CLI, for quickly scaffolding projects and creating the necessary files and it also allows the page designer to reuse design elements from other pages.

## Table of contents
1. [Overview of Lede](#overview-of-lede)
    1. [The project model](#the-project-model)
    2. [Example workflows](#example-workflows)
    3. [The command line interface](#the-command-line-interface)
        1. [Commands](#cli-commands)
2. [Installation](#installation)
    1. [Mac install](#mac-install)
    2. [Windows install](#windows-install)
3. Tutorials
4. Technical implementation details

## Overview of Lede
### The project model
Lede uses a specific model for generating pages and it’s important to understand these basic basic building blocks before anything else.

The most basic building block in Lede is a _project_. A project has a one-to-many relationship with pages (see below), that is, a project can have multiple pages but a page must belong to only one project. Everything you create in Lede will belong to a project. __A project simply allows you to define elements that are common across pages__. Examples of things that might be common across a set of pages include meta tags and seo information for a reporting package.

After a project comes a _page_. Pages are conceptually simple, they __encapsulate all the content that will be massaged into a working web page__. One thing to note is that every page must belong to a project. For a one off story page, this means you will create a project and then create a page within a project. For a bigger journalism package with multiple stories you may find yourself creating a project that has multiple pages.

![Project/page diagram](doc/images/page-project.png)

A page itself is made up of many different assets, which we will dive into later, but for now we’ll focus on two – _materials_, and _blocks_. Let’s look at materials first.

Anyone who is familiar building webpages knows that a website consists of html for structure, css for styling, and javascript for interactivity. A page may also request other assets such as json via xhr. In Lede, a page’s styles, scripts, and data assets come in the form of materials. In other words, __materials are styles, scripts, and files that should be included on a page__.

In modern-day web development, it is common for developers to compile css and js from other languages. Lede accounts for this by running scripts and styles through compilers which will transpile them into plain javascript and css. By default, Lede compiles [sass](http://sass-lang.com/) into css and the latest version of javascript, [ES6](http://es6-features.org/#Constants), into a version of javascript that can be run by older browsers (ES5). In the case of both, you can just write plain css or js because the sass and ES6 are supersets of the language and will transpile without error.

![Page/materials diagram](doc/images/page-materials.jpg)

Aside from materials, pages in Lede also contain blocks. __Blocks are essentially wrappers for chunks of html__ (which come in the form of bits, but more on that next). Organizing pages into blocks has two benefits – the first is that blocks are reusable. You can create a standard header block and then include it on multiple pages so that the pages are use the same header. If you need to update the header, making a change to the block will automatically propagate that change to every page that uses the header!

The second benefit to using blocks is that the content of the block can be fetched from somewhere else using a concept called a resolver. Resolvers are an advanced concept that we won’t get into here. By default, Lede uses a resolver that can pull content in from Google Docs and put it on the page.

The final concept integral to Lede are bits. __Bits are templated chunks of html__. Because bits are templated, you can make generic bits and feed them different content. For example, you could make a full screen image bit and then use it multiple times on a page, and even on multiple pages. Additionally, bits can specify scripts and styles that should be included on the page with them. By default, Lede uses [nunjucks](https://mozilla.github.io/nunjucks/) to create the html templates. Bits are inserted onto a page within blocks. For example, a header block might include a top bar, some social share buttons, and a customizeable text block. These three bits would be included in the header block and any page that uses that header block would automatically get those three bits.

![Bit/block diagram](doc/images/bit-block.png)

Confused yet? We'll walk through some example workflows next. Later on, we will go through some in-depth tutorials.

### Example workflows
Creating an article page from scratch:

1. Create a new project for the page.
2. Create a new page.
3. Create 3 new blocks – one for the header, one for the article body, and one for the footer.
4. Create the bits for the header (a header bar, share buttons, a hero image).
5. Hook the header block up toe the Google Doc and use the Google Doc to populate the content in the header bits (what text goes in the header bar, what image is the hero image, which social media sites to link the share buttons to).
6. Create an article block.
7. Create bits for the article block (text, subheads, full screen photos, inline photos, etc.).
8. Hook the article block up to a Google Doc and use the Google Doc to populate the content in the article (article tex, subheads, images and placement withtin the story).
9. Create a footer block.
10. Create bits for the footer block (related story callout, comments section, copyright info).
11. Link the footer block to a Google Doc and use the Google Doc to populate the content in the footer block (copyright date, related stories, comment tracker id).
12. Update page metadata and add any additional stylesheets or scripts.

This may look like a lot of steps for a single page, but thanks to the magic of Lede, the next time you create a page like this you will already have the bits and blocks. So that process may look like this:

1. Create a new project for the page.
2. Create a new page.
3. Import the blocks, bits, and materials from the previous project. Place the header and footer blocks on the page as-is.
4. Create an article block for the page.
5. Hook the Google Doc up to the article block and use it to populate the page with the bits we already created.
6. Edit the materials to give the page a personalized look – change colors, fonts, etc.

Building bits and blocks that are easily reincorporated on different pages in different projects requires some careful planing and diligence. Later on We'll look at patterns for building reusable bits and blocks, but first let's talk about Lede's command line interface.

### The command line interface
The command line interface, also known as the CLI, is a way to interact with a piece of software via the command line (AKA terminal, AKA shell, AKA command prompt, et cetera). Lede comes with its very own CLI, and once you learn how to use it, you will be churning out projects at a breakneck pace. Don't worry if this seems a little foreign to you right now, you will become very familiar with the CLI as you continue to work with Lede because it is the primary way to run the software.

You can use the Lede CLI with the following syntax `lede <command>... [options]` where you substitute `<command>` with the command you want to run and `[options]` is where you specify arguments to augment it's behavior. Remember, you don't always have to pass `[options]` to a command, the square brackets connote that they are [optional]. The `<command>...` means that some commands allow or even require you to pass more than one argument. If this seems complicated, don't worry, we'll be explicit when that is the case! Remember, you don't have to learn every command and option up front and there are plenty of examples in the next section.

Now, let's take a look at what the Lede CLI has to offer.

_note: If you forget how a command works, you can typically call up some help by entering `<command> [-h] | [--help]`. I say typically here because lede does not yet have help baked into the commands, but it's on my todo list._

#### CLI commands
CLI commands can be found in the [CLI documentation](https://github.com/tbtimes/lede-cli).

## Installation

### Mac install
1. Install [nvm](https://github.com/creationix/nvm) with `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash` and [apple xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)
2. Install the LTS version of node with `nvm install 6.9` and set it to default with `nvm alias default 6.9`. _note: if nvm isn't working for you, try [manually installing](https://github.com/creationix/nvm#manual-install) it instead of using the curl script._
3. Add the following environment keys to your `.bash_profile` and then close and reopen your terminal:
    * `export GH_TOKEN=<your github user token>`
    * `export GAPI_KEY=<your google apis key>`
4. If you have a previous version of lede installed, rename the binary. You can find it with `which lede` and rename it with ``mv `which lede` <new path>``.
5. Install the latest version of the cli with `npm install -g lede-cli`. During the install process, it may prompt you to overwrite some configuration files if they exist. If you are prompted, you should answer `y`.
6. Finally, install the Tampa Bay Times' project config with `lede config <your github user>/<config repo name>`.


### Windows install
1. Install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) by following the link and choosing `nvm-setup.zip` under downloads. Also, install [Git](https://git-scm.com/download/win).
2. Open the start menu, right click on "computer", and select "properties" from the drop down.
    1. ![open properties](doc/images/windows_open_props.png)
3. Click on "Advanced system settings" and then "Environment Variables" in the bottom right corner under the "Advanced" tab of the dialog.
    1. ![advanced settings](doc/images/windows_advanced_settings.png)
4. Now, on the top half of the dialog, click "New...".
    1. ![new button](doc/images/windows_new_button.png)
5. In the "Variable name" field, enter `GH_TOKEN`; in the "Variable value" field, enter `<your github user token>` and click "Ok".
6. Click again on the "New..." button on the top half of the dialog. In the "Variable name" field, enter `GAPI_KEY`; in the "Variable value" field, enter `<your google apis key>` and click "Ok".
7. Click "Ok" to close the "Environment Variables" dialog and "Ok" again to close the "System Properties" dialog.
8. Now open up the command line by clicking the start button, typings cmd, and pressing enter.
9. Inside the command line, install the LTS version of node with `nvm install 6.9.0`.
10. From the command line, run `npm install -g --production windows-build-tools`.
11. Again from the command line, install the latest version of lede with `npm install -g lede-cli` During the install process, it may prompt you to overwrite some configuration files if they exist. If you are prompted, you should answer `y`.
12. Finally, install the Tampa Bay Times project config with `lede config <your github user>/<config repo name>` (also from the command line).

## Settings files
Now that we have Lede installed and we've talked about the CLI and the project model at a high level, it's time to get into the nitty gritty of Lede.

#### Project
We've already discussed what a Lede project is, so let's look at how it actually works. When you run `lede new project <name>` where <name> is the name of the project it will create a new directory with that name, and inside the directory will be a set of files and folders.
##### Project structure
```
- assets/
- bits/
- blocks/
    - header/
    - footer/
- images/
    - fullscreen/
    - mugs/
- pages/
- scripts/
- styles/
    - bunch of files
- .gitignore
- package.json
- <name>.projectSettings.js
```
The first thing you want to do is go into the directory from the command line and run `npm install`. This will install the core Lede module and dependencies into the project. You can now sucessfully build a Lede project in this directory. First though, let's go over the files and folders in here, starting from the top.
##### assets/ (folder)
This folder contains assets that are not scripts or styles but that you may want to include on a page. Things like csv files or json.
##### bits/ (folder)
This folder is going to contain all of the bits you can use in your project. Your project will automatically contain a set of common bits that Martin created for use in any project. We'll discuss these in more depth later.
##### blocks/ (folder)
This folder is going to contain all of the blocks you can use in your project. By default, this will contain a header and a footer block that can be included on any page. Again, we'll discuss these in more depth later.
##### images/ (folder)
The images folder contains two sub folders: fullscreen and mugs. Images that may be used fullscreen in a project go in the fullscreen folder, images for mugs go in the mugs folder. Once images are placed in this folder, you can run `lede image` from the command line to process these images. The images are then sent to AWS and resized and output into
##### pages/ (folder)
This folder holds all the pages that are part of your Lede project. To be continued ...
##### scripts (folder)
This folder holds all of your individual script files you can use in your project. By default, none of these scripts are included on your pages unless you explicitly say so (you will learn how to do this later). However, even if they aren't included on your page, they are surfaced to the script loader. In other words, any file in here that exports a javascript module can be imported by any other scripts (in this directory or a by script that is part of a bit). This is a more advanced javascript concept and if you don't already understand what the above means, you shouldn't worry about it because you probably won't be using this feature for some time.
##### styles (folder)
The styles folder holds all of the sass files that are available to your pages. Like scripts, none of these styles are included on your pages by default but they can be imported by other styles.
##### .gitignore
This is a special file that you can completely ignore for now. It is used to tell git which files to backup when you make a commit. If that makes no sense to you, don't worry, you will probably never touch this file.
##### package.json
This file holds meta information about your project and a list of javascript dependencies. Again, you will likely never touch this file directly (although if you are installing third party javascript modules, this file will change automatically to add those dependencies to the dependency list.
##### <name>.projectSettings.js
This file is the "meat" of your project. In it, you specify the version of the project (for creating Lede modules, an advanced concept we won't touch on yet), a template for the page, the top level url path, and default scripts, assets, styles, blocks, metaTags, and resources that should be included on every page. By default, `lede new project <name>` will create a file that looks like this:

```javascript
class SettingsConfig {
    constructor() {
        this.deployRoot = "some-seo-root-path-here";
        this.version = 1;
        this.defaults = {
            scripts: [],
            assets: [],
            styles: [],
            blocks: [],
            metaTags: [],
            resources: [
                {
                    head: [],
                    body: []
                }
            ]
        }
        this.template = function({styles, scripts, context}) { ... }
    }
}
```

Let's discuss each of these properties:

`this.deployRoot`: the deploy root for a project is the base path for the url. All pages are nested under this path. For example, if you compile the above project with a page that has the path `test` the resulting url will be `www.tampabay.com/projects/2017/some-seo-roo-path-here/test/`. This is likely to be the only field you change in this file.

`this.version`: This is a version number for the project, which is used only when you turn a project into a lede module. You can ignore this for now.

`this.defaults`: This property specifies defaults that should be applied to every page. It contains fields for default scripts, assets, styles, blocks, metaTags, and resources. We will discuss each of these in more detail when we talk about pages.

`this.template`: The template property is a function that takes an object containing scripts, styles, and context for the page. You can think of this as the outer shell of a page into which blocks and bits are injected at compile time. This is advanced and you shouldn't have to touch it because Martin already set it up for you.

#### Page
Now that you have a project created, it's time to create a page. You can do this with the `lede new page <name>` command. This will create a new file in the `pages` folder, `<name>.pageSettings.js`. By default, the that file will look like this:

```javascript

// PAGE CONFIG
const BLOCKS = [];
const STYLES = [];
const SCRIPTS = [];
const ASSETS = [];
const HEAD_RESOURCES = [];
const BODY_RESOURCES = [];
const META = [];

// SEO GOODNESS – make sure this is up-to-date before project launch
const PROJ_NAME = "<name>";
const SECTION = "";
const WEBHED = ""; // serves a FB title, social hed and analytics
const TWHED = ""; // serves as Twitter title if different than FB title.
const DESCRIPTION = "";
const YEAR = "2017";
const NAME = "";
const DEPLOY_PATH = "";
const URL = `http://www.tampabay.com/projects/${YEAR}/${SECTION.toLowerCase()}/${PROJ_NAME.toLowerCase()}/${DEPLOY_PATH}`;
const SOCIAL_IMG = "";
const IMG_WIDTH = "1200";
const IMG_HEIGHT = "630";
const AUTHOR = "";
const TITLE = `${PROJ_NAME} | ${SECTION} | Tampa Bay Times`;

// THE NITTY GRITTY – If everything above is set correctly, you shouldn't have to edit anything below this line

class SettingsConfig { ... }
// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;

```
The BLOCKS variable is where you define which blocks are included on the page. Each block is specified in the format ``"<projectName>/<blockName>"` and each block separated by commas.

The STYLES variable is where you specify which stylesheets should be included on the page. The format is `{ id: "<projectName>/<file>" }`. Multiple styles are separated by commas.

The SCRIPTS variable is where you specify which scripts should be included on the page. The format is the same as for STYLES.

The ASSETS variable specifies which assets are included with the page and is formatted the same as STYLES and SCRIPTS.

The HEAD_RESOURCES variable specifies text that should be included in the head of the page. This is useful for loading assest from a CDN.

The BODY_RESOURCES variable is the same as the HEAD_RESOURCES variable except that these are included on the body of the page.

The META variable is where you define properties that should be included as meta tages on the page. They take the format of `{ name: "...", content: "..."}` separated by commas.

All the other variables have to do with page SEO and should be self-explanatory.

#### Blocks
You can create a new block with the command `lede new block <name>`. This will create a file `<name>.blockSettings.js` in the blocks folder. The file looks like this:
```javascript
const AmlResolver = require("lede").resolvers.AmlResolver;

class SettingsConfig {
  constructor() {
    this.source = new AmlResolver("GOOGLE_DOCS_ID_GOES_HERE", process.env.GAPI_KEY);
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
```

All you need to do to use a block is update the string "GOOGLE_DOC_ID_GOES_HERE" to be the id of the google doc you want to fetch. For Lede to fetch the document, it must first be shared publicly. Google docs must be in the format:
```
[CONTENT]
// bits go here
[]
```

#### Bits
You can create a new bit with the command `lede new bit <name>`. This will create a folder in bits called <name>. Inside that folder will be four files: `<name>.bitSettings.js`, `<name>.html`, `<name>.js`, and `<name>.scss`. The html, js, and scss files are used to build the bit wherever it is included on the page. You can ignore the bitSettings.js file.

The html file of the bit is the nunjucks template. You can read more about creating nunjucks templates [here](https://mozilla.github.io/nunjucks/templating.html). Each bit has access to a set of special variables:

`$bit` - this variable contains any of the context that you pass into the bit through the aml. It also has a special `$name` property where you can access the name of the bit.

`$block` - this variable allows you to access the content of the block which contains the bit. State can be stored on the block by adding a `this.context` property to the blockSettings file and can then be accessed directly on the `$block` object. `$block` also contains a `$name` property with the name of the block, a `$template` property which has the block's template string, and `bits` property which is an array containing all of the bits that make up the block.

`$PAGE` - this variable contains information about the page. By default a page has a `$name` property that has the page name. Aside from that, you can add other properties to the page state by adding a `this.context` property in the pageSettings file.

`$PROJECT` - this variable give you access to project variables. By default it has a `$name` property, a `$debug` property which tells you whether the page is being served locally or in production, and any state stored on the `this.context` property in the projectSettings file.

## Advanced Lede features
TODO
