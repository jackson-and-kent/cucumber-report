const fs = require("fs");
const htmlReport = require("./create_html_report.js");
const slackReport = require("./send_slack_report.js");

exports.loadReport = function (parameters) {

	return new Promise((resolve, reject) => {

		if (parameters == undefined) {

			reject("loadReport - No parameters given, please refere to documentation : https://github.com/jackson-and-kent/cucumber-report");

		}

		// We require the filepath
		if (parameters.filepath == undefined) {

			reject("loadReport - No filepath given to load cucumber report.");

		}

		// We make sure the file is there
		try {

			if (fs.existsSync(parameters.filepath)) {

				resolve(JSON.parse(fs.readFileSync(parameters.filepath)));

			}

		} catch (err) {

			reject(`loadReport - File ${parameters.filepath} not found.`);

		}


	});

};

exports.toHtml = function (parameters) {

	return new Promise((resolve, reject) => {

		if (parameters == undefined) {

			reject("toHtml - No parameters given, please refere to documentation : https://github.com/jackson-and-kent/cucumber-report");

		}

		// We require the report
		if (parameters.report == undefined) {

			reject("toHtml - No JSON report given.");

		}

		// We require the filepath
		if (parameters.filepath == undefined) {

			reject("toHtml - No filepath given to write html report.");

		}

		// We require the title
		if (parameters.title == undefined) {

			reject("toHtml - No title given.");

		}

		// If the logoPath is given, we set it
		let logoPath = parameters.logoPath != undefined ? parameters.logoPath : undefined;

		htmlReport.createHTMLReport(parameters.report, parameters.title, parameters.filepath, logoPath);
		resolve(parameters.report);

	});

};

exports.toSlack = function (parameters) {

	return new Promise((resolve, reject) => {

		if (parameters == undefined) {

			reject("toSlack - No parameters given, please refere to documentation : https://github.com/jackson-and-kent/cucumber-report");

		}

		// We require the report
		if (parameters.report == undefined) {

			reject("toSlack - No JSON report given.");

		}

		// We require the slack token
		if (parameters.token == undefined) {

			reject("toSlack - No slack token given.");

		}

		// We require the conversationId
		if (parameters.conversationId == undefined) {

			reject("toSlack - No slack conversationId given.");

		}

		// We require the title
		if (parameters.title == undefined) {

			reject("toSlack - No title given.");

		}

		// Facultative parameters
		let linkURL = parameters.linkURL != undefined ? parameters.linkURL : undefined;
		let limitFailedTestShown = parameters.limitFailedTestShown != undefined ? parameters.limitFailedTestShown : 10;
		let giphyAPIKey = parameters.giphyAPIKey != undefined ? parameters.giphyAPIKey : undefined;
		let giphyTag = parameters.giphyTag != undefined ? parameters.giphyTag : "happy";

		slackReport.sendReport(parameters.report, parameters.token, parameters.conversationId, parameters.title, linkURL, limitFailedTestShown, giphyAPIKey, giphyTag);
		resolve(parameters.report);

	});

};
