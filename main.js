const fs = require("fs");
const htmlReport = require("./src/report/create_html_report.js");
const slackReport = require("./src/report/send_slack_report.js");
const slackRegression = require("./src/regressions/send_slack_report.js");
const regression = require("./src/regression.js");

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


				console.log("Report found, loading.");
				resolve(JSON.parse(fs.readFileSync(parameters.filepath)));

			} else {

				reject(`loadReport - File ${parameters.filepath} not found.`);

			}

		} catch (err) {


			reject(`loadReport - Load erorr of file ${parameters.filepath}.`);

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
		if (parameters.report == undefined && parameters.regressions == undefined) {

			reject("toSlack - No JSON report or regressions given.");

		}

		// We require the slack token
		if (parameters.token == undefined) {

			reject("toSlack - No slack token given.");

		}

		// We require the conversationId
		if (parameters.conversationId == undefined) {

			reject("toSlack - No slack conversationId given.");

		}

		// Facultative parameters
		let title = parameters.title !== undefined && parameters.title !== "" ? parameters.title : undefined;
		let linkURL = parameters.linkURL !== undefined && parameters.linkURL !== "" ? parameters.linkURL : undefined;
		let limitFailedTestShown = parameters.limitFailedTestShown !== undefined && parameters.limitFailedTestShown !== "" ? parameters.limitFailedTestShown : 10;
		let giphyAPIKey = parameters.giphyAPIKey !== undefined && parameters.giphyAPIKey !== "" ? parameters.giphyAPIKey : undefined;
		let giphyTag = parameters.giphyTag !== undefined && parameters.giphyTag !== "" ? parameters.giphyTag : "happy";
		let sendMessageIfAllSuccess = parameters.sendMessageIfAllSuccess !== undefined && parameters.sendMessageIfAllSuccess !== "" ? parameters.sendMessageIfAllSuccess : true;
		let filesToSend = parameters.filesToSend !== undefined && parameters.filesToSend !== "" ? parameters.filesToSend : [];
		let sendFileIfAllSuccess = parameters.sendFileIfAllSuccess !== undefined && parameters.sendFileIfAllSuccess !== "" ? parameters.sendFileIfAllSuccess : true;

		if (parameters.report != undefined) {

			slackReport.sendReport(parameters.report, parameters.token, parameters.conversationId, title, linkURL, sendMessageIfAllSuccess, limitFailedTestShown, giphyAPIKey, giphyTag, filesToSend, sendFileIfAllSuccess);
			resolve(parameters.report);

		} else {

			slackRegression.sendReport(parameters.regressions, parameters.token, parameters.conversationId, title, linkURL, limitFailedTestShown, giphyAPIKey, giphyTag);
			resolve(parameters.regressions);

		}

	});

};

exports.findRegression = function (parameters) {

	return new Promise((resolve, reject) => {

		if (parameters == undefined) {

			reject("findRegression - No parameters given, please refere to documentation : https://github.com/jackson-and-kent/cucumber-report");

		}

		// We require the report
		if (parameters.report == undefined) {

			reject("findRegression - No JSON report given.");

		}

		// We require the log dir
		if (parameters.logDir == undefined) {

			reject("findRegression - No logDir token given.");

		}

		// We require the logFilenameFormat
		if (parameters.logFilenameFormat == undefined) {

			reject("findRegression - No slack logFilenameFormat given.");

		}

		regression.findRegression(parameters.report, parameters.logDir, parameters.logFilenameFormat).
			then((regressions) => {

				resolve(regressions);

			}).
			catch((error) => {

				console.error(error);

			});

	});

};
