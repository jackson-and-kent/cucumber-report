/*
This a test file for the reporter.

Usage :
node ./test_report.js
*/
const reporter = require("../main.js");
require("dotenv").config();

console.log("JANDK CUCUMBER REPORT DEMO STARTED");

// Loading the report
reporter.loadReport({
	"filepath": "./cucumber_report.json"
}).then((report) => {

	// Creating the HTML report
	reporter.toHtml({
		report,
		"filepath": "htmlreport.html",
		"title": "REPORT TITLE",
		"logoPath": "./logo.png"
	}).catch((error) => {

		console.error(error);

	});

	// Sending synthesis to SLACK
	reporter.toSlack({
		report,
		"filesToSend": [
			"./cucumber_report.json",
			"wrong/path/to/show/error",
			"./demo.js"
		], // file(s) sent
		"title": "REPORT TITLE", // facultative
		"token": process.env.SLACK_TOKEN, // See https://api.slack.com/apps
		"conversationId": process.env.SLACK_CHANNEL,
		"sendMessageIfAllSuccess": false, // default to true
		"sendFileIfAllSuccess": false, // default to true
		"linkURL": "http://link-to-html-report", // facultative
		"limitFailedTestShown": 10, // Slack limits at 50 - default to 10
		"giphyAPIKey": process.env.GIPHY_API_KEY, // If you have no failed test and wish to celebrates with a gif, get an API Key : https://developers.giphy.com/ - facultative
		"giphyTag": "happy" // facultative
	}).catch((error) => {

		console.error(error);

	});

	// Finding regressions
	/* reporter.findRegression({
		report,
		"logDir": "./logs",
		"logFilenameFormat": "YYYY-MM-DD-HH" // moment.js format date syntax (https://momentjs.com/docs/#/displaying/format/)
	}).then((regressions) => {

		// Sending those to slack
		reporter.toSlack({
			regressions,
			"token": process.env.SLACK_TOKEN, // See https://api.slack.com/apps
			"title": "TESTING MODULE", // facultative
			"conversationId": process.env.SLACK_CHANNEL,
			"limitFailedTestShown": 10, // Slack limits at 50 - default to 10
			"giphyAPIKey": process.env.GIPHY_API_KEY, // If you have no regressions and wish to celebrates with a gif, get an API Key : https://developers.giphy.com/ - facultative
			"giphyTag": "happy" // facultative
		});

	});*/

}).catch((error) => {

	console.error(error);

});
