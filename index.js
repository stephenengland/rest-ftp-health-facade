var express = require('express'),
  nconf = require('nconf'),
  FtpClient = require('ftp'),
  response = require('./response'),
  apicache = require('apicache'),
  app = express();

nconf.argv().env();
nconf.file("./config.json");
nconf.file("servers", "./servers.json");
nconf.load();

var cacheTime = nconf.get("cacheTime") || 60000;
apicache = apicache.options({
  "debug": false,
  "defaultDuration": cacheTime,
  "enable": (cacheTime > 0)
}).middleware;

var createFtpClient = function (res) {
  var ftp = new FtpClient();
  ftp.on("error", function (err) {
    response.ftpError(err, res);
    ftp.end();
  });

  return ftp;
};

app.get('/info/:host', function (req, res) {
  var host = server.address().address;
  if (host === '::') {
    host = "localhost";
  }
  var port = server.address().port;

  res.json({
    "description": "FTP HealthCheck Monitor that checks a FTP server or file",
    "ftpHost": req.params.host,
    "serverHost": host,
    "serverPort": port,
    "ui": {
      "hide": ["serverHost", "serverPort"]
    }
  });
  res.hasEnded = true;
  res.end();
});

app.get('/info/:host/:file', function (req, res) {
  var host = server.address().address;
  if (host === '::') {
    host = "localhost";
  }
  var port = server.address().port;

  res.json({
    "description": "FTP HealthCheck Monitor that checks a FTP server or file",
    "ftpHost": req.params.host,
    "ftpPath": "/" + ( req.params.file || ""),
    "serverHost": host,
    "serverPort": port,
    "ui": {
      "hide": ["serverHost", "serverPort"]
    }
  });
  res.hasEnded = true;
  res.end();
});

app.get('/:host', apicache(), function (req, res) {
  var host = req.params.host;
  if (!host) {
    response.badRequest(res, "Invalid hostname");
    return;
  }

  var path = "/" + host;
  var ftp = createFtpClient(res);
  ftp.on("ready", function () {
    ftp.status(function(err, status){
      response.ftpStatusResponse(err, status, res, path);
      ftp.end();
    });
  });
  ftp.connect({
    "host": host,
    "port": nconf.get("servers:" + host + ":port") || 21,
    "user": nconf.get("servers:" + host + ":username") || "anonymous",
    "password": nconf.get("servers:" + host + ":password") || ""
  });
});

app.get('/:host/:file', apicache(), function (req, res) {
  var host = req.params.host;
  var file = req.params.file;
  if (!host || !file) {
    response.badRequest(res, "Invalid host or filepath");
    return;
  }
  console.log("Checking File");
  var path = "/" + host + "/" + file;
  var ftp = createFtpClient(res);
  ftp.on("ready", function () {
    ftp.list(file, function(err, list){
      response.ftpListResponse(err, list, res, path);
      ftp.end();
    });
  });
  ftp.connect({
    "host": host,
    "port": nconf.get("servers:" + host + ":port") || 21,
    "user": nconf.get("servers:" + host + ":username") || "anonymous",
    "password": nconf.get("servers:" + host + ":password") || ""
  });
});

var server = app.listen(nconf.get('port') || 3000, function () {
  var host = server.address().address;
  if (host === '::') {
    host = "localhost";
  }
  var port = server.address().port;

  console.log('FTP HealthCheck REST API listening at http://%s:%s', host, port);
});