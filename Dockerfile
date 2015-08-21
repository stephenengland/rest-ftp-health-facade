FROM node:slim

ADD node_modules /etc/rest-ftp-monitor/node_modules
ADD config.json /etc/rest-ftp-monitor/config.json
ADD *.js /etc/rest-ftp-monitor/

WORKDIR /etc/rest-ftp-monitor

EXPOSE 9090

CMD node /etc/rest-ftp-monitor/index.js