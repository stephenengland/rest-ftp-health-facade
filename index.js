var express = require('express'),
  nconf = require('nconf'),
  FtpClient = require('ftp'),
  path = require('path'),
  os = require("os"),
  response = require('./response'),
  apicache = require('apicache'),
  ftpHistory = require('./ftpHistory'),
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

var createFtpClient = function (res, host, path) {
  var ftp = new FtpClient();
  ftp.on("error", function (err) {
    response.ftpError(err, res, host, path);
    ftp.end();
  });

  return ftp;
};

app.get('/info/:host/:fileOrFolder?', function (req, res) {
  var host = req.params.host;
  var port = server.address().port;
  var fileOrFolder = req.params.fileOrFolder;
  var file = req.query.file; // For files at the root of the FTP

  var path = "/" + host;
  if (fileOrFolder) {
    path += "/" + fileOrFolder;
  }
  if (file) {
    path += "/?file=" + file;
  }

  var response = {
    "description": "FTP HealthCheck Monitor that checks a FTP server or file",
    "host": host,
    "healthCheckHost": hostname,
    "healthCheckPort": port,
    "ui": {
      "hide": ["healthCheckHost", "healthCheckPort"]
    }
  };
  if (file || fileOrFolder) {
    response.ftpPath = "/" + (fileOrFolder || "") + (file || "");
  }
  response.history = ftpHistory.getRecentStatus(path);

  res.jsonp(response);
  res.hasEnded = true;
  res.end();
});

app.get('/:host/:folder?', apicache(), function (req, res) {
  var host = req.params.host;
  var fileOrFolder = req.params.folder;
  var file = req.query.file; // For files at the root of the FTP
  if (!host || host === 'favicon.ico' || host === 'undefined') {
    response.badRequest(res, "Invalid hostname", host);
    return;
  }

  var path = "/" + host;
  var ftpPath = "";
  if (fileOrFolder) {
    path += "/" + fileOrFolder;
    ftpPath += fileOrFolder;
  }
  if (file) {
    path += "/?file=" + file;
    ftpPath += "/" +file;
  }
  
  var ftp = createFtpClient(res, host, path);
  ftp.on("ready", function () {
    if (file || fileOrFolder) {
      ftp.list(ftpPath, function (err, list) {
        response.ftpListResponse(err, list, res, path, host);
        ftp.end();
      });
    }
    else {
      ftp.status(function (err, status) {
        response.ftpStatusResponse(err, status, res, path, host);
        ftp.end();
      });
    }
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