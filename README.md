# Cucumber-report
This node module use cucumber's JSON report file to create an html report and send slack synthesis.

## Installation
```
npm install jandk-cucumber-report
```

## Usage
In your cucumber.conf.js, in an AfterAll hook (https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md), tell the reporter to load the report file, then to produce the html report and to send a synthesis to the slack channel.

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
				"title": "REPORT TITLE",
				"token": "XXXXX-SLACK-APPLICATION-TOKEN", // See https://api.slack.com/apps
				"conversationId": "#the-channel-you-want-the-report-sent-to",
				"linkURL": "http://link-to-html-report",
				"limitFailedTestShown": 10, // Slack limits at 50
				"giphyAPIKey": "XXXXXXXXXXXXXX", // If you have no failed test and wish to celebrates with a gif, get an API Key : https://developers.giphy.com/
				"giphyTag": "happy"
			}).catch((error) => {
				console.error(error);
			});

		}).catch((error) => {
			console.error(error);
		});

	}, 1000);

}
```


## TODO
- Historification of cucumber's report
- Report regression by analysing reports history
- Report new successfull tests by analysing reports history
- Implement test to allow anyone to update module safely
- Have html templates/modules to change style