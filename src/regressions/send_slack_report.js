require("isomorphic-fetch");
const {WebClient} = require("@slack/web-api");
const {GiphyFetch} = require("@giphy/js-fetch-api");

exports.sendReport = function (regressions, token, conversationId, title, linkURL, limitFailedTestShown = 10, giphyAPIKey = undefined, giphyTag = "happy") {

	return new Promise((resolve, reject) => {

		// SLACK MESSAGE
		let titleText = "";
		if (title != undefined) {

			titleText = linkURL != undefined ? `*<${linkURL}|${title}>*` : `*${title}*`;

		}
		const slackMessageBase = [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `${titleText}\nnbrRegressions regressions`
				}
			}
		];
		slackMessage = loopOnRegressionsAndFillSlackMessage(regressions, slackMessageBase, limitFailedTestShown, giphyAPIKey, giphyTag).
			then((slackMessage) => {

				sendSlackMessage(token, conversationId, slackMessage).then(resolve).catch(reject);

			});

	});

};


function loopOnRegressionsAndFillSlackMessage (regressions, slackMessageBase, limitFailedTestShown, giphyAPIKey, giphyTag) {

	return new Promise((resolve, reject) => {

		let slackMessage = [...slackMessageBase];

		// Number of regressions
		slackMessage[0].text.text = slackMessage[0].text.text.
			replace("nbrRegressions", regressions.length);

		if (limitFailedTestShown == 0) {

			resolve(slackMessage);

		} else if (regressions.length > limitFailedTestShown) {

			slackMessage.push({
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `${regressions.length} tests have regressed, it's too much to be shown (limit set at ${limitFailedTestShown}).`
				}
			});
			resolve(slackMessage);

		} else {

			// Loop on regressions
			let lastFeatureId;
			regressions.forEach((regression) => {

				let sectionFields = [];
				if (regression.feature.id != lastFeatureId) {

					sectionFields.push({
						"type": "mrkdwn",
						"text": `*${getPathLib(regression.feature)}*`
					});
					sectionFields.push({
						"type": "mrkdwn",
						"text": "  "
					});
					lastFeatureId = regression.feature.id;

				}

				sectionFields.push({
					"type": "mrkdwn",
					"text": `${regression.test.name}`
				});

				if (sectionFields.length > 0) {

					slackMessage.push({
						"type": "section",
						"fields": sectionFields
					});
					sectionFields = [];

				}

			});

			// In case of full success, we add a little gif
			slackMessage = handleGiphyBonus(slackMessage, regressions.length, giphyAPIKey, giphyTag).
				then((slackMessage) => resolve(slackMessage));

		}

	});

}

function handleGiphyBonus (slackMessage, nbrLeft, giphyAPIKey, giphyTag) {

	return new Promise((resolve, reject) => {

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

				resolve(slackMessage);

			}).catch((error) => {

				reject(error);

			});

		} else {

			resolve(slackMessage);

		}

	});

}

function sendSlackMessage (token, conversationId, slackMessage) {

	return new Promise((resolve, reject) => {

		const slack = new WebClient(token);

		slack.chat.postMessage({"channel": conversationId,
			"blocks": slackMessage}).then((result) => {

			console.log(`CUCUMBER REPORT - Regressions sent to slack : ${conversationId}`);
			resolve(result);

		}).catch((error) => {

			reject(error);

		});

	});

}

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
