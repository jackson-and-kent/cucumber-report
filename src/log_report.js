const fs = require("fs");
const moment = require("moment");

exports.createLog = function (report, logDir, logFilenameFormat) {

	return new Promise((resolve, reject) => {

		if (!fs.existsSync(logDir)) {

			reject(`Given logDir (${logDir}) does not exists`);

		}

		let filename = moment().format(logFilenameFormat);
		let filepath = `${logDir}/${filename}.json`;

		fs.writeFileSync(filepath, JSON.stringify(report), (error) => {

			reject(error);

		});

		resolve();

	});

};

exports.getEvolutionArray = function (logDir, logFilenameFormat) {

	let evolutionArray = [];
	return new Promise((resolve, reject) => {

		try {

			const logs = fs.readdirSync(logDir);

			// We loop on the logs to construct our array
			for (const logFilename of logs) {

				let filepath = `${logDir}/${logFilename}`;

        		logJSON = JSON.parse(fs.readFileSync(filepath));

        		updateEvolutionArrayWithLog(evolutionArray, logJSON, logFilename, logFilenameFormat);

			}

			resolve(evolutionArray);

		} catch (error) {

			reject(error);

		}

	});

};

function updateEvolutionArrayWithLog (evolutionArray, logJSON, logFilename, logFilenameFormat) {

	// We loop on the features
	for (const feature of logJSON) {

		const featureName = feature.name;

		// We loop on the tests
		for (const test of feature.elements) {

			const testId = test.id;
			const hasPassed = hasTestPassed(test);

			if (evolutionArray[testId] == undefined) {

				evolutionArray[testId] = [];

			}

			const datetime = moment(logFilename.replace(".json", ""), logFilenameFormat).toISOString();
			const featureToAdd = { ...feature };
			delete featureToAdd.elements;
			const testToAdd = { ...test };
			delete testToAdd.steps;

			const testInfos = {
				datetime,
				hasPassed,
				"feature": featureToAdd,
				"test": testToAdd
			};

			evolutionArray[testId].push(testInfos);

			evolutionArray[testId].sort(sortTestInfos);

		}

	}

}

function hasTestPassed (test) {

	// We loop on the steps
	for (const step of test.steps) {

		if (step.result.status != "passed") {

			return false;

		}

	}
	return true;

}

function sortTestInfos (testInfo1, testInfo2) {

	const date1 = moment(testInfo1.datetime);
	const date2 = moment(testInfo2.datetime);

	return date1.isAfter(date2);

}
