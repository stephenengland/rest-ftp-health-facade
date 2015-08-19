var ftpHistory = require('./ftpHistory');

module.exports = {
  "getResponseType": function (isStatus, numberOfFiles) {
    if (isStatus) {
      return "FTP Server";
    }

    if (numberOfFiles === 1) {
      return "FTP File";
    }

    return "FTP Directory";
  },
  "ftpError": function (err, res, host, path) {
    ftpHistory.processFtpResponse(path, 'down');
    if (res.hasEnded) { return; }

    res.status(502).jsonp({
      "host": host,
      "errorMessage": err
    });

    res.hasEnded = true;
    res.end();
  },
  "healthyResponse": function (data, res) {
    res.status(200);
    res.jsonp(data);
    res.hasEnded = true;
    res.end();
  },
  "ftpStatusResponse": function (err, data, res, path, host) {
    if (err) {
      ftpHistory.processFtpResponse(path, 'down');
      this.ftpError(err, res);
    }
    else {
      ftpHistory.processFtpResponse(path, 'up');
      this.healthyResponse({
        "statusMessage": data,
        "type": this.getResponseType(true),
        "host": host,
        "ui": {
          "hide": ['statusMessage'],
          "info": "/info" + path,
          "history": "/history" + path
        }
      }, res);
    }
  },
  "ftpListResponse": function (err, data, res, path, host) {
    if (err || !data || !data.length) {
      ftpHistory.processFtpResponse(path, 'down');
      this.ftpError(err, res);
    }
    else {

      var responseData = {
        "numberOfFiles": data.length,
        "type": this.getResponseType(false, data.length),
        "host": host,
        "ui": {
          "info": "/info" + path,
          "history": "/history" + path
        }
      };

      if (data.length === 1) {
        responseData.fileName = data[0].name;
        if (data[0].date) {
          responseData.date = data[0].date;
        }
      }
      ftpHistory.processFtpResponse(path, 'up');
      this.healthyResponse(responseData, res);
    }
  },
  "badRequest": function (res, reason) {
    reason = "The data you sent was invalid. " + (reason || "");
    res.hasEnded = true;
    res.status(500).send(reason).end();
  }
};