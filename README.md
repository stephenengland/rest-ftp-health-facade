# rest-ftp-health-facade
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

### From the public Docker container
Create a Dockerfile:
```
FROM sengland/rest-ftp-monitor

ADD servers.json /etc/rest-ftp-monitor/servers.json
```
Where servers.json is your configuration (See the "Configuration" section below)

Run the following to build/start your container:
```
docker build -t="ftpmonitor" .
docker run -d --name="ftpmonitor" -p 9090:9090 ftpmonitor
```

You should now be able to curl//wget//use your browser on: http://localhost:9090/ftp.ed.ac.uk

### From Source

```
git clone https://github.com/thealah/rest-ftp-health-facade.git
npm install
npm start
```

### Install as a Windows Service
`npm install node-windows`
`node ./windows-service --install`
### Other Windows Service operations
```
node ./windows-service --uninstall
node ./windows-service --start
node ./windows-service --stop
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
