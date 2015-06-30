var express = require('express'),
  nconf = require('nconf'),
  FtpClient = require('ftp'),
  path = require('path'),
  os = require("os"),
  response = require('./response'),
  apicache = require('apicache'),
  app = express();

nconf.argv().env();
nconf.file(path.join(__dirname, "config.json"));
nconf.file("servers", path.join(__dirname, "servers.json"));
nconf.load();

var hostname = os.hostname();

var cacheTime = nconf.get("cacheTime") || 60000;
apicache = apicache.options({
  "debug": false,
  "defaultDuration": cacheTime,
  "enable": (cacheTime > 0)
}).middleware;

var createFtpClient = function (res, host) {
  var ftp = new FtpClient();
  ftp.on("error", function (err) {
    console.log(err);
    response.ftpError(err, res, host);
    ftp.end();
  });

  return ftp;
};

app.get('/info/:host', function (req, res) {
  var port = server.address().port;

  res.jsonp({
    "description": "FTP HealthCheck Monitor that checks a FTP server or file",
    "host": req.params.host,
    "healthCheckHost": hostname,
    "healthCheckPort": port,
    "ui": {
      "hide": ["healthCheckHost", "healthCheckPort"]
    }
  });
  res.hasEnded = true;
  res.end();
});

app.get('/info/:host/:file', function (req, res) {
  var port = server.address().port;

  res.jsonp({
    "description": "FTP HealthCheck Monitor that checks a FTP server or file",
    "host": req.params.host,
    "ftpPath": "/" + ( req.params.file || ""),
    "healthCheckHost": hostname,
    "healthCheckPort": port,
    "ui": {
      "hide": ["healthCheckHost", "healthCheckPort"]
    }
  });
  res.hasEnded = true;
  res.end();
});

app.get('/:host', apicache(), function (req, res) {
  var host = req.params.host;
  if (!host) {
    response.badRequest(res, "Invalid hostname", host);
    return;
  }

  var path = "/" + host;
  var ftp = createFtpClient(res, host);
  ftp.on("ready", function () {
    ftp.status(function(err, status){
      response.ftpStatusResponse(err, status, res, path, host);
      ftp.end();
    });
  });

  var hostCredentials = nconf.get(host);
  ftp.connect({
    "host": host,
    "port": (hostCredentials && hostCredentials.port) || 21,
    "user": (hostCredentials && hostCredentials.username) || "anonymous",
    "password":  (hostCredentials && hostCredentials.password) || "",
    "secure":  (hostCredentials && hostCredentials.server) || false
  });
});

app.get('/:host/:file', apicache(), function (req, res) {
  var host = req.params.host;
  var file = req.params.file;
  if (!host || !file) {
    response.badRequest(res, "Invalid host or filepath", host);
    return;
  }
  
  var path = "/" + host + "/" + file;
  var ftp = createFtpClient(res, host);
  ftp.on("ready", function () {
    ftp.list(file, function(err, list){
      response.ftpListResponse(err, list, res, path, host);
      ftp.end();
    });
  });
  var hostCredentials = nconf.get(host);
  ftp.connect({
    "host": host,
    "port": (hostCredentials && hostCredentials.port) || 21,
    "user": (hostCredentials && hostCredentials.username) || "anonymous",
    "password":  (hostCredentials && hostCredentials.password) || "",
    "secure":  (hostCredentials && hostCredentials.server) || false
  });
});

var server = app.listen(nconf.get('port') || 3000, function () {
  var port = server.address().port;

  console.log('FTP HealthCheck REST API listening on port %s', port);
});