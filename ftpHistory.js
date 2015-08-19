var _ = require('underscore-node'),
	store = require('./node-store')();

var hasLoadedHistory = false;
var lastKnownSave = null; 
var history =  {
	"id": "history"
};
var fileIoLimitInMilliseconds = 5000;
var maxHistory = 10;

//Save the ftp history. We don't care if we 'miss' a save or two.. this isn't sensitive data. Better not to thrash file io.
var saveHistory = function () {
	if (hasLoadedHistory && (!lastKnownSave || (lastKnownSave - new Date()) > fileIoLimitInMilliseconds)) {
		store.add(history, function (err) {
			if (err) {
				console.log(err);
			}
		});
	}
};

var pushToHistory = function (uri, status) {
	var changed = false;
	if (!history[uri]) {
		history[uri] = [{
			'status': status,
			'sinceDate': new Date(),
			'lastChecked': new Date(),
			'timesChecked': 1
		}];
		changed = true;
	}
	else {
		var currentItems = _.sortBy(history[uri], function (historyItem) {
			return historyItem.date;
		});

		if (currentItems[currentItems.length - 1].status !== status) {
			if (history[uri].length > maxHistory) {
				currentItems.shift();
			}
			currentItems.push({
				'status': status,
				'sinceDate': new Date(),
				'lastChecked': new Date(),
				'timesChecked': 1
			});
			history[uri] = currentItems;
			changed = true;
		}
		else {
			currentItems[currentItems.length - 1].lastChecked = new Date();
			currentItems[currentItems.length - 1].timesChecked++;
		}
	}

	saveHistory();
};

store.load("history", function (err, loadedHistory) {
	if (!err) {
		history = loadedHistory;
		history.id = "history";
	}
	hasLoadedHistory = true;
});

module.exports = {
	"processFtpResponse": function (uri, status) {
		if (uri) {
			pushToHistory(uri, status);
		}
	},
	"getRecentStatus": function (uri) {
		if (!history.hasOwnProperty(uri) || history[uri].length === 0) {
			return {
				'status': 'unknown',
				'sinceDate': new Date(),
				'lastChecked': new Date()
			};
		}
		var currentItems = _.sortBy(history[uri], function (historyItem) {
			return historyItem.date;
		});
		return currentItems[currentItems.length - 1];
	}
};