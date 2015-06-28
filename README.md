# rest-ftp-health-fascade
A REST endpoint to check on FTP servers. 

HTTP GET actions that return a status code and some details for use in a HealthCheck Endpoint UI application (to be covered later).

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
git clone https://github.com/thealah/rest-ftp-health-fascade.git
npm install
npm start
```

## Configuration
Edit the config.json file to edit the REST server's port and cache duration
```
{
  "port": 9090,
  "cacheTime": 30000
}
```

Edit the servers.json file to add your FTP options. (user, password, ssl)
```
{
  "ftp.ed.ac.uk": {
    "username": "ftp",
    "password": "",
    "secure": false,
    "port": 21
  }
}
```

## Contributing

Please make sure and run the REST api tests:

```
  npm start
```

And in another console window:

```
npm install -g jasmine-node
npm test
```
