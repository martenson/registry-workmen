registry-workmen
================

[![Build Status](https://travis-ci.org/biojs/registry-workmen.svg?branch=master)](https://travis-ci.org/biojs/registry-workmen)

The BioJS registry backend.

Workflow
---------

1) Search for all packages with a special tag on npm ('biojs', bionode')  + remove duplicate packages (uniq)  
2) Query npm -> package.json  
3) Run extensions  
3.1) npm: history stats  
3.2) github  
3.2.1) github info  
3.2.2) github stats  
3.2.3) Optional: Query github for snippets  (ls "snippets")  
4) Run post processing (e.g. removal of duplicate keywords)  
5) Store the result in a DB  

Currently the db is cleaned on every run.

(see `workflow.js`)

![Registry workmen workflow](https://raw.githubusercontent.com/biojs/registry-workmen/master/structure/workmen_structure_2014_11.png)

Use
----

A working instance can be browsed at `workmen.biojs.net`.
If you want deploy access, ping @greenify - otherwise just send us a pull request here.

Cronjobs
----------

* check for package version: 60 seconds
* refresh all packages: 60 minutes

Available views
--------------

### Registry information

[`/all`](http://workmen.biojs.net/all): JSON with all biojs packages
  
  
[`/detail/:name`](http://workmen.biojs.net/detail/biojs-sniper): info for only one BioJS packages

[`/stat`](http://workmen.biojs.net/stat): General statistics

#### Snippet pages

[`/demo/:name`](http://workmen.biojs.net/demo/biojs-vis-msa): Listing of all available snippets

[`/demo/:name/:snippet`](http://workmen.biojs.net/demo/biojs-vis-msa/msa_show_menu): Display the `:snippet`.

#### Edit in a online JS editor

Will forword you to the specific editors with the snippet.

[`/jsbin/:name/:snippet`](http://workmen.biojs.net/jsbin/biojs-vis-msa/msa_show_menu)

[`/codepen/:name/:snippet`](http://workmen.biojs.net/codepen/biojs-vis-msa/msa_show_menu)

[`/plunker/:name/:snippet`](http://workmen.biojs.net/plunker/biojs-vis-msa/msa_show_menu)

#### Package news

[`/news/atom`](http://workmen.biojs.net/news/atom): Display the package event stream in the ATOM format

[`/news/rss`](http://workmen.biojs.net/news/atom): Display the package event stream in the RSS format

[`/news/json`](http://workmen.biojs.net/news/json): Display the package event stream in JSON

You can filter with the following parameter

* `limit`: many results show be shown (default: 5)
* `versions`: what versions show be shown (default: all)
e.g. http://workmen.biojs.net/news/json?versions=major&versions=minor 
(new package updates will be shown too)

#### Debug

[`/logs`](http://workmen.biojs.net/logs): Display the latest log outputs

(see `server.js`)


Install
-------

```
git clone https://github.com/biojs/registry-workmen
cd registry-workmen
npm install
```

You might need to setup github API credentials (see below).

Run
----

```
node server.js
```

(will be running on [Port 3000](http://localhost:3000))


Write an extension
-------------------

Two requirements

1) Return a promise
2) Add your extension to "downloadPkg" in `workflow.js`


Creds for github
------

Create your own oAuth token here

https://github.com/settings/applications

### a) via `creds.json`

`creds.json` (root folder)

```
{type:"oauth", token:"<token>"}
```

### b) via ENVs

define an enviroment variable

```
export GITHUB_TOKEN=<token>
```

[more info](https://www.npmjs.org/package/github)
