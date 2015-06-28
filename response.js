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
  "ftpError": function (err, res) {
    if (res.hasEnded) { return; }

    res.status(502).send({
      "errorMessage": err
    });

    res.hasEnded = true;
    res.end();
  },
  "healthyResponse": function (data, res) {
    res.status(200);
    res.send(data);
    res.hasEnded = true;
    res.end();
  },
  "ftpStatusResponse": function (err, data, res, path) {
    if (err) {
      ftpError(err, res);
    }
    else {
      this.healthyResponse({
        "statusMessage": data,
        "type": this.getResponseType(true),
        "ui": {
          "hide": ['statusMessage'],
          "info": "/info" + path
        }
      }, res);
    }
  },
  "ftpListResponse": function (err, data, res, path) {
    if (err || !data || !data.length) {
      ftpError(err, res);
    }
    else {
      var responseData = {
        "numberOfFiles": data.length,
        "type": this.getResponseType(false, data.length),
        "ui": {
          "info": "/info" + path
        }
      };

      if (data.length === 1) {
        responseData.fileName = data[0].name;
      }
      this.healthyResponse(responseData, res);
    }
  },
  "badRequest": function (res, reason) {
    reason = "The data you sent was invalid. " + (reason || "");
    res.hasEnded = true;
    res.status(500).send(reason).end();
  }
};