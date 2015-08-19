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

app.get('/info/:host', function (req, res) {
  var port = server.address().port;
  var file = req.query.file; // For files at the root of the FTP

  if (file) {
    res.jsonp({
      "description": "FTP HealthCheck Monitor that checks a FTP server or file",
      "host": req.params.host,
      "ftpPath": "/" + file,
      "healthCheckHost": hostname,
      "healthCheckPort": port,
      "ui": {
        "hide": ["healthCheckHost", "healthCheckPort"]
      }
    });
  }
  else {
    res.jsonp({
      "description": "FTP HealthCheck Monitor that checks a FTP server or file",
      "host": req.params.host,
      "healthCheckHost": hostname,
      "healthCheckPort": port,
      "ui": {
        "hide": ["healthCheckHost", "healthCheckPort"]
      }
    });
  }
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

app.get('/history/:host', function (req, res) {
  var host = req.params.host;
  var file = req.query.file; // For files at the root of the FTP
  var path = "/" + host;
  if (file) {
    path += "/?file=" + file;
  }
  res.jsonp(ftpHistory.getRecentStatus(path));
  res.end();
});

app.get('/history/:host/:file', function (req, res) {
  var host = req.params.host;
  var file = req.params.file;
  if (!host || !file) {
    response.badRequest(res, "Invalid host or filepath", host);
    return;
  }
  
  var path = "/" + host + "/" + file;
  res.jsonp(ftpHistory.getRecentStatus(path));
  res.end();
});

app.get('/:host', apicache(), function (req, res) {
  var host = req.params.host;
  var file = req.query.file; // For files at the root of the FTP
  if (!host) {
    response.badRequest(res, "Invalid hostname", host);
    return;
  }

  var path = "/" + host;
  if (file) {
    path += "/?file=" + file;
  }
  var ftp = createFtpClient(res, host, path);
  ftp.on("ready", function () {
    if (file) {
      ftp.list("/" + file, function (err, list) {
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

app.get('/:host/:folder', apicache(), function (req, res) {
  var host = req.params.host;
  var fileOrFolder = req.params.folder;
  if (!host || !fileOrFolder) {
    response.badRequest(res, "Invalid host or filepath", host);
    return;
  }
  
  var path = "/" + host  + "/" + fileOrFolder;

  var ftp = createFtpClient(res, host, path);
  ftp.on("ready", function () {
    ftp.list(fileOrFolder, function (err, list) {
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