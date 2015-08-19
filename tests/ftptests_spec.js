var frisby = require('frisby'),
    path = require('path'),
    nconf = require('nconf');

nconf.argv().env();
nconf.file({ file: path.join(__dirname, '..', 'config.json')});

frisby.create('Get FTP Server Status')
  .get('http://localhost:' + nconf.get('port') + '/ftp.ed.ac.uk')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json; charset=utf-8')
  .expectJSON({
    type: 'FTP Server'
  })
  .expectJSONTypes({
    statusMessage: String,
    type: String
  })
  //.inspectJSON()
.toss();

frisby.create('Get FTP Server Status - Bad Host Name')
  .get('http://localhost:' + nconf.get('port') + '/ftp.axcvzwererzersdfawerze.com')
  .expectStatus(502)
  //.inspectJSON()
.toss();

frisby.create('Get FTP File')
  .get('http://localhost:' + nconf.get('port') + '/ftp.ed.ac.uk/INSTRUCTIONS-FOR-USING-THIS-SERVICE')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json; charset=utf-8')
  .expectJSON({
    numberOfFiles: 1,
    type: 'FTP File',
    fileName: 'INSTRUCTIONS-FOR-USING-THIS-SERVICE'
  })
  .expectJSONTypes({
    numberOfFiles: Number,
    type: String,
    fileName: String
  })
  //.inspectJSON()
.toss();


frisby.create('Get FTP Path - Invalid Path')
  .get('http://localhost:' + nconf.get('port') + '/ftp.ed.ac.uk/asdfzerwer-zsdfzsdf-zwerzwer-zwerzwer-zwerzwer')
  .expectStatus(502)
  //.inspectJSON()
.toss();

frisby.create('Get FTP Directory')
  .get('http://localhost:' + nconf.get('port') + '/ftp.ed.ac.uk/pub')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json; charset=utf-8')
  .expectJSON({
    type: 'FTP Directory'
  })
  .expectJSONTypes({
    numberOfFiles: Number,
    type: String
  })
  //.inspectJSON()
.toss();

frisby.create('Get FTP Directory - Empty')
  .get('http://localhost:' + nconf.get('port') + '/ftp.ed.ac.uk/edupload')
  .expectStatus(502)
  //.inspectJSON()
.toss();