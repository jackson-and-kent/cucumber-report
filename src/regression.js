const log = require("./log_report.js");

exports.findRegression = function (report, logDir, logFilenameFormat) {

	return new Promise((resolve, reject) => {

		log.createLog(report, logDir, logFilenameFormat).
			then(() => {

				log.getEvolutionArray(logDir, logFilenameFormat).then((evolutionArray) => {

					resolve(lookForRegressions(evolutionArray));

				});

			}).
			catch((error) => {

				reject(error);

			});

	});

};

function lookForRegressions (evolutionArray) {

	// We loop on the tests
	let testsThatHasRegressed = [];
	let testsAdded = [];
	for (const id in evolutionArray) {

		const testInfos = evolutionArray[id];

		let wasPassingBefore;
		for (const testInfo of testInfos) {

			if (!testInfo.hasPassed && wasPassingBefore) {

				if (testsAdded.indexOf(testInfo.test.id) === -1) {

					testsThatHasRegressed.push(testInfo);
					testsAdded.push(testInfo.test.id);

				}

			} else if (!testInfo.hasPassed) {

				wasPassingBefore = false;

			} else if (testInfo.hasPassed) {

				wasPassingBefore = true;

			}

		}

	}

	return testsThatHasRegressed;

}
