# rest-ftp-health-fascade
A REST endpoint to check on FTP servers. 

HTTP gets that return a status code and some details for use in a HealthCheck Endpoint UI application (to be covered later).

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
git clone https://github.com/thealah/rest-ftp-health-fascade.git.
npm install
npm start
```

Edit the servers.json file to add your FTP options. (user, password, ssl)
