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

				// If we already added it to the regression array, this means we added it from an old historic so we need to remove if
				let addedIndex = testsAdded.indexOf(testInfo.test.id);
				if (addedIndex > -1) {

					testsThatHasRegressed.splice(addedIndex, 1);
					testsAdded.splice(addedIndex, 1);

				}

			}

		}

	}

	return testsThatHasRegressed;

}
