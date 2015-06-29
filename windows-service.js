var Service = require("node-windows").Service,
  path = require('path'),
  nconf = require('nconf');

nconf.argv().env();
nconf.file(path.join(__dirname, "config.json"));
nconf.load();

var serviceName = nconf.get("serviceName") || "REST FTP HealthCheck";
var description = nconf.get("serviceDescription") || "A REST endpoint to perform health checks on FTP servers";
var svc = new Service({
  name: serviceName,
  description: description,
  script: path.join(__dirname, "index.js")
});

svc.on("install", function () {
  svc.start();
});
svc.on("error", function (err) {
  console.log(err);
});
svc.on("alreadyinstalled", function () {
  console.log("This service has already been installed.");
});

if (nconf.get("install")) {
  console.log("Installing service " + serviceName);
  svc.install();
}
else if (nconf.get("uninstall")) {
  console.log("Uninstalling service " + serviceName);
  svc.uninstall();
}
else if (nconf.get("stop")) {
  console.log("Stopping service " + serviceName);
  svc.stop();
}
else if (nconf.get("start")) {
  console.log("Starting service " + serviceName);
  svc.start();
}