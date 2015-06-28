# rest-ftp-health-fascade
A REST endpoint to check on FTP servers

## Interface

```
/$HOST
```
Health Check on a FTP Server.

Example:

http://localhost:9090/ftp.ed.ac.uk

```
/$HOST/$FILEPATH
```
Health Check on a FTP File or Directory.

Examples:

* http://localhost:9090/ftp.ed.ac.uk/pub
* http://localhost:9090/ftp.ed.ac.uk/INSTRUCTIONS-FOR-USING-THIS-SERVICE

## Setup

```
npm install -g rest-ftp-health-fascade
rest-ftp-health-fascade
```

Edit the servers.json file to add your FTP options. (user, password, ssl)
