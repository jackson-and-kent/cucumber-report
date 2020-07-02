require("isomorphic-fetch");
const {WebClient} = require("@slack/web-api");
const {GiphyFetch} = require("@giphy/js-fetch-api");

exports.sendReport = function (report, token, conversationId, title, linkURL, limitFailedTestShown = 10, giphyAPIKey = undefined, giphyTag = "happy") {

	// SLACK MESSAGE
	let titleText = linkURL != undefined ? `*<${linkURL}|${title}>*` : `*${title}*`;
	let slackMessageBase = [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${titleText} - Test end to end\n*nbrElementsPassed*/nbrElementsTotal (*pourcElementPassed%*) - nbrLeft left to do - time`
			}
		}
	];
	slackMessage = loopOnFeaturesAndFillSlackMessage(report, slackMessageBase, limitFailedTestShown);

	sendSlackMessage(token, conversationId, slackMessage);

};


function loopOnFeaturesAndFillSlackMessage (report, slackMessageBase, limitFailedTestShown, giphyAPIKey, giphyTag) {

	// Loop on features
	let failures = [];
	let nbrElementsTotal = 0;
	let nbrElementsPassed = 0;
	let dividerPushed = false;
	let totalDuration = 0;
	let slackMessage = [...slackMessageBase];
	report.forEach((feature) => {

		// Loop on feature elements
		let elementPassed = true;
		let featurePushed = false;
		let sectionFields = [];
		feature.elements.forEach((element) => {

			elementPassed = true;

			// Loop on steps
			element.steps.forEach((step) => {

				if (step.result.status != "passed") {

					elementPassed = false;

				}

				totalDuration += Number.isInteger(step.result.duration) ? step.result.duration : 0;

			});

			if (elementPassed) {

				nbrElementsPassed++;

			} else {

				if (!dividerPushed) {

					slackMessage.push({
						"type": "divider"
					});
					slackMessage.push({
						"type": "section",
						"text": {
							"type": "mrkdwn",
							"text": "*FAILED TESTS*"
						}
					});
					dividerPushed = true;

				}

				if (!featurePushed) {

					sectionFields.push({
						"type": "mrkdwn",
						"text": `*${getPathLib(feature)}*`
					});
					sectionFields.push({
						"type": "mrkdwn",
						"text": "  "
					});
					featurePushed = true;

				}

				sectionFields.push({
					"type": "mrkdwn",
					"text": `${element.name}`
				});

			}

			nbrElementsTotal++;

			if (sectionFields.length > 0) {

				slackMessage.push({
					"type": "section",
					"fields": sectionFields
				});
				sectionFields = [];

			}

		});

	});

	// Slack limits the number of blocks to 50
	// So if we have too much error to report, we show a message instead
	let nbrLeft = nbrElementsTotal - nbrElementsPassed;
	if (nbrLeft > limitFailedTestShown) {

		slackMessage = [...slackMessageBase];
		slackMessage.push({
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${nbrElementsTotal - nbrElementsPassed} tests have failed, it's too much to be shown (limit set at ${limitFailedTestShown}).`
			}
		});

	}

	// Percentage success
	const pourcElementPassed = Math.floor(100 * nbrElementsPassed / nbrElementsTotal);
	slackMessage[0].text.text = slackMessage[0].text.text.
		replace("nbrElementsTotal", nbrElementsTotal).
		replace("nbrElementsPassed", nbrElementsPassed).
		replace("pourcElementPassed", pourcElementPassed).
		replace("nbrLeft", nbrLeft);

	// Duration string
	const durationString = totalDuration;
	slackMessage[0].text.text = slackMessage[0].text.text.replace("time", durationString.toHHMMSS());

	// In case of full success, we add a little gif
	if (nbrLeft == 0 && giphyAPIKey != undefined) {

		const gf = new GiphyFetch(giphyAPIKey);
		let congratsImageURL = "";

		gf.random({
			"tag": giphyTag
		}).then((result) => {

			congratsImageURL = result.data.fixed_height_downsampled_url;

			slackMessage.push({
				"type": "image",
				"image_url": congratsImageURL,
				"alt_text": "Congrats !!"
			});

		}).catch((error) => {

			console.error(error);

		});

	}

	return slackMessage;

}

function sendSlackMessage (token, conversationId, slackMessage) {

	const slack = new WebClient(token);

	slack.chat.postMessage({"channel": conversationId,
		"blocks": slackMessage}).then((result) => {

		console.log(`CUCUMBER REPORT - Report sent to slack : ${conversationId}`);

	}).catch((error) => {

		console.error(error);

	});

}

// https://stackoverflow.com/a/6313008/3005056 but modified
Number.prototype.toHHMMSS = function () {

	let totalSeconds = this / 1000000000;
	let hours = Math.floor(totalSeconds / 3600);
	let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
	let seconds = Math.floor(totalSeconds - hours * 3600 - minutes * 60);

	if (hours < 10) {

		hours = `0${hours}`;

	}
	if (minutes < 10) {

		minutes = `0${minutes}`;

	}
	if (seconds < 10) {

		seconds = `0${seconds}`;

	}

	let finalString = "";
	if (hours > 0) {

		finalString = `${hours}h${minutes}min${seconds}s`;

	} else {

		finalString = `${minutes}min${seconds}s`;

	}

	return finalString;

};

function getPathLib (feature) {

	let pathLib = "";
	if (feature.uri.indexOf("\\") > -1) { // Windows

		pathLib = `${feature.uri.replace("features\\", "").replace(/\\[^\\]*.feature/, "").replace(/\\/g, " > ")} > ${feature.name}`;

	} else {

		// Linux&Mac
		pathLib = `${feature.uri.replace("features\/", "").replace(/\/[^\/]*.feature/, "").replace(/\//g, " > ")} > ${feature.name}`;

	}

	return pathLib.replace(/^[0-9]*_/, "").replace("_", " ").toUpperCase();

}
