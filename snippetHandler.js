module.change_code = 1; // this allows hotswapping of code (ignored in production)

var swig = require("swig");
var request = require("request");
var loadSnippet = require("./snippetDemo");
var snipResponse = require("./snippetResponse");

var snip = {};

snip.demo  = function (req, res){
  var name = req.params.name;
  var currentSnip = req.params.snip;
  global.db().find({name: name}).exec(function (err, pkg) {
    if(pkg.length == 0 || pkg[0].latest.sniper == undefined){
      res.send({error: "no snips"});
      return;
    }
    loadSnippet({pkg: pkg[0], currentSnip: currentSnip,res:res}, function (item){
      snipResponse._demoFill(res,item,pkg[0]);
    });
  });
};

// https://github.com/jsbin/jsbin/blob/v1.0.0/index.php#L77
snip.jsbin = function (req,res){
  snip.edit(req,res, function(snip){
    var js = snip.inlineScript;
    var body = swig.renderFile(__dirname + "/templates/header.html", {
      scripts: snip.js, css: snip.css});
    body += "\n" +snip.inlineBody;
    res.render("jsbin", {html: body, js: js, redirectURL: "http://jsbin.com?js,output"});
  });
}

// http://blog.codepen.io/documentation/api/prefill/
snip.codepen = function(req,res){
  snip.edit(req,res, function(snip){
    var js = snip.inlineScript;
    var body = swig.renderFile(__dirname + "/templates/header.html", {
      scripts: snip.js, css: snip.css});
    body += "\n" +snip.inlineBody;
    var obj = { js: js, html: body};
    obj =  JSON.stringify(obj); 
    obj = obj.replace(/"/g, '\"'); // unscrew quotes
    res.render("codepen", {obj: obj, redirectURL: "http://codepen.io/pen/define"});
  });
}

snip.edit = function(req, res, callback){
  var name = req.params.name;
  var currentSnip = req.params.snip;
  global.db().find({name: name}).exec(function (err, pkg) {
    if(pkg.length == 0 || pkg[0].latest.sniper == undefined){
      res.send({error: "no snips"});
      return;
    }
    loadSnippet({pkg: pkg[0], currentSnip: currentSnip, res: res}, function (snip){
      for(var i in snip.js){
        snip.js[i]= snip.js[i].replace("/github/", global.ghProxy);
      }
      for(var i in snip.css){
        snip.css[i]= snip.css[i].replace("/github/", global.ghProxy);
      }
      snip.inlineScript = snip.inlineScript.replace("/github/", global.ghProxy);
      callback(snip);
    });
  });
}

// list available snips
snip.overview = function(req, res){
  var name = req.params.name;
  var currentSnip = req.params.snip;
  global.db().find({name: name}).exec(function (err, pkg) {
    if(pkg.length == 0|| pkg[0].latest.sniper == undefined){
      res.send({error: "no snips"});
      return;
    }
    var pkg = pkg[0];
    var baseURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    // remove path at the end
    if(baseURL.charAt(baseURL.length - 1) !== "/" ){
      baseURL += "/";
    }
    if(pkg.latest.sniper.srcs == undefined){
      res.send({error: "no github sources found."});
      return;
    }
    var snips = Object.keys(pkg.latest.sniper.srcs);
    res.render("list",{snips: snips, baseHref: baseURL}); 
  });
};

// simple github proxy
snip.github = function(req, res){
  var name = req.params.name;
  var repo = req.params.repo;
  var path = req.params[0];
  var url = "https://raw.githubusercontent.com/" + name + "/" + repo + "/" + 
   path; 

  // TODO: minify gzip
  // TODO: cache locally
  request.get(url, function (err, response, body) {
    res.send(body);
  });
};

module.exports = snip;