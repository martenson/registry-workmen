var request = require("request");
var q = require('rsvp');

module.exports = function(obj, callback){
  var currentSnip = obj.currentSnip;
  var res = obj.res;
  var pkg = obj.pkg;
  var snip = pkg.latest.sniper;

  if(pkg.github == undefined){
    res.status(500).send("github repo does not exist");  
    return;
  }

  // load browserified version
  snip.js.push("http://wzrd.in/bundle/" + pkg.name + "@" + pkg.version);

  // expose other bundles
  if(snip.exposed !== undefined){
    for(var i=0;i<snip.exposed.length; i++){
      snip.js.push("http://wzrd.in/bundle/" + snip.exposed[i] + "@latest");
    }
  }


  var baseURL = convertGithubToRaw(pkg.github.html_url + "/" + pkg.github.default_branch);

  // css
  // the user might specify alternative css locations
  if( snip.buildCSS !== undefined){
    snip.css = snip.buildCSS;
  }

  // translate all absolute URLs to github
  for(var i in snip.css){
    if(snip.css[i].charAt(0) === "/"){
      snip.css[i] = baseURL + snip.css[i];
    }
  }

  // remove the build js (generated by browserify)
  var index = 0;
  while(index < snip.js.length){ 
    if(snip.js[index].substring(0,7) === "/build/"){
      snip.js.splice(index,1);
    } else {
      index++;
    }
  }

  // download snippets on-the-fly
  var ps = [];
  if(snip.srcs[currentSnip] === undefined){
    console.log("no js file found" , currentSnip, snip.srcs[currentSnip]);  
    res.status(500).send("no js file found exist");  
  }

  // js
  snip.inlineScript = "";
  if(snip.srcs[currentSnip].js === undefined){
    console.log("no js file found" , currentSnip, snip.srcs[currentSnip]);  
  }else{
    var jsURL = convertGithubToRaw(snip.srcs[currentSnip].js.html_url);
    ps.push(new q.Promise(function(resolve,reject){
      request.get(jsURL, function (err, response, body) {
        snip.inlineScript = body;
        resolve();
      });
    }));
  }

  // html
  snip.inlineBody = "";
  if(snip.srcs[currentSnip].html !== undefined ){
    var htmlURL = convertGithubToRaw(snip.srcs[currentSnip].html.html_url);
    ps.push(new q.Promise(function(resolve,reject){
      request.get(htmlURL, function (err, response, body) {
        snip.inlineBody = body;
        resolve();
      });
    }));
  }else{
    snip.inlineBody = "<div id=yourDiv></div>";
  }

  q.all(ps).then(function(){
    callback(snip);
  });
}

function convertGithubToRaw(contentURL){
  contentURL = contentURL.replace("github.com", "raw.githubusercontent.com");
  contentURL = contentURL.replace("blob/", "");
  return contentURL;
}
