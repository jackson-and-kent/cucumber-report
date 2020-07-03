# Cucumber-report
This node module use cucumber's JSON report file to create an html report and send slack synthesis.

## Installation
```
npm install jandk-cucumber-report
```

## Usage
In your cucumber.conf.js, in an AfterAll hook (https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md), tell the reporter to load the report file, then to produce the html report and/or to send a synthesis to the slack channel.

```
const reporter = require('cucumber-report');

...

AfterAll(() => {

	setTimeout(() => { // We have to give time to cucumber to write the report file

		// Loading the report
		reporter.loadReport({
			filepath: "./cucumber_report.json"
		}).then((report) => {

			// Creating the HTML report
			reporter.toHtml({
				"report": report,
				"filepath": "htmlreport.html",
				"title": "REPORT TITLE",
				"logoPath": "./logo.png"
			}).catch((error) => {
				console.error(error);
			});

			// Sending synthesis to SLACK
			reporter.toSlack({
				"report": report,
				"title": "REPORT TITLE", // facultative
				"token": "XXXXX-SLACK-APPLICATION-TOKEN", // See https://api.slack.com/apps
				"conversationId": "#the-channel-you-want-the-report-sent-to",
				"linkURL": "http://link-to-html-report", // facultative
				"limitFailedTestShown": 10, // Slack limits at 50 - default to 10
				"giphyAPIKey": "XXXXXXXXXXXXXX", // If you have no failed test and wish to celebrates with a gif, get an API Key : https://developers.giphy.com/ - facultative
				"giphyTag": "happy" // facultative
			}).catch((error) => {
				console.error(error);
			});

			// Finding regressions
			reporter.findRegression({
				"report": report,
				"logDir": "./logs",
				"logFilenameFormat": "YYYY-MM-DD-HH" // moment.js format date syntax (https://momentjs.com/docs/#/displaying/format/)
			}).then((regressions) => {

				// Sending those to slack
				reporter.toSlack({
					"regressions": regressions,
					"token": "xoxp-23680643893-23680643909-1137874862966-7d608c82b06574a107e0bfcad4ca4f48",
					"title": "TESTING MODULE", // facultative
					"conversationId": "#test-slack",
					"limitFailedTestShown": 10, // Slack limits at 50 - default to 10
					"giphyAPIKey": "XXXXXXXXXXXXXX", // If you have no regressions and wish to celebrates with a gif, get an API Key : https://developers.giphy.com/ - facultative
					"giphyTag": "happy" // facultative
				});

			})

		}).catch((error) => {
			console.error(error);
		});

	}, 1000);

}
```

### limitFailedTestShown
If set to 0, no message will be shown.

### About regression
This functionnality need to log the tests session in order to compare what just happened to what happened before.
To do so, they save the current report to a directory with a datetime format filename. By changing this datetime format you can control the granularity of the log :
- If you save report with "YYYY-MM-DD-HH-mm-ss-SSS" you will have every tests saved
- If you save report with "YYYY-MM-DD" you will have 1 test saved per day (the last one)

Ajust your granularity to how often you run your tests.

Watch out for a too fine granularity : ``findRegression`` and ``findNewSuccess`` might create 2 different logs if the ``logFilenameFormat`` use seconds or milliseconds.

## TODO
- Handle empty cucumber's report
- Report new successfull tests by analysing reports history
- Implement test to allow anyone to update module safely
- Have html templates/modules to change style
- Explain feature arboresence naming system