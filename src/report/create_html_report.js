/*
TODO
- Add keywords Given, And et Then
- Handle datatables
- Add a filter by tags
*/
const fs = require("fs");

exports.createHTMLReport = function (report, title, filepath, logoPath) {

	let html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">";
	html += "<style>";
	html += "*{font-family: Arial;margin:0px;padding:0px;}body{background-color:#2784ff;}";
	html += ".global{display:flex;flex-direction:row;justify-content:flex-start;align-items:flex-start;width:100%;}";
	html += ".menu{display:flex;flex-direction:column;justify-content:flex-start;align-items:center;position:absolute;width:300px;min-height:100vh;background-color:#2784ff;}";
	html += ".menu .logo {display:flex;flex-direction:row;justify-content:center;align-items:center;position:relative;top:0px;width:100%;background-color:#ffffff;padding:54px 0px;}";
	html += ".menu .logo img{width:80%;height:auto;}";
	html += ".menu ul{display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;margin-top:20px;}";
	html += ".menu ul li{display:flex;font-size:20px;line-height:20px;font-weight:bold;color:#013273;text-decoration:none;padding:8px 0px;}";
	html += ".menu ul li a{font-size:16px;line-height:16px;color:#ffffff;font-style:normal;text-decoration:none;text-transform:uppercase;}";
	html += ".menu ul li a:hover{font-weight:bold;color:#024194;}";
	html += ".menu ul li.failed a{color:#ff6f6f;font-size:14px;line-height:14px;font-weight:bold;}";
	html += ".menu ul li.passed a{color:#3de19a;font-size:14px;line-height:14px;font-weight:normal;}";
	html += ".menu ul li.undefined a{color:#d0c401;font-size:14px;line-height:14px;font-weight:bold;}";
	html += ".menu ul ul{margin:0px 0px 20px 20px;}";
	html += ".menu ul ul li{font-size:14px;line-height:14px;font-weight:normal;text-transform:uppercase;}";
	html += ".content{display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;background-color:#ffffff;margin-left:300px;padding:40px;}";
	html += ".menu ul ul ul{margin:0px 0px 0px 20px;}";
	html += ".content .feature{display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-start;width:100%;background-color:#f7fbff;border:1px solid #e7f2ff;border-radius:20px;margin-bottom:40px;}";
	html += ".content .feature .title{display:flex;flex-direction:row;justify-content:flex-start;align-items:center;width:calc(100% - 80px);font-size:18px;line-height:18px;font-weight:bold;font-style:italic;color:#024194;text-transform:uppercase;padding:40px;background-color:#62cffc;border-top-left-radius:20px;border-top-right-radius:20px;}";
	html += ".content .feature .scenario{font-size:16px;line-height:16px;padding:10px 40px;margin:10px 0px;}";
	html += ".content .feature .scenario .name{font-size:16px;line-height:16px;font-weight:bold;text-transform:uppercase;color:#333333;margin:10px 0px;cursor:pointer;}";
	html += ".content .feature .scenario ul.steps{margin-left:40px;}";
	html += ".content .feature .scenario .steps li{font-weight:bold;padding:10px 10px;}";
	html += ".content .feature .scenario .steps li.passed{color:#02bc6b;list-style-type:'\\2714'}";
	html += ".content .feature .scenario .steps li.failed{color:#db0202;list-style-type:'\\2716'}";
	html += ".content .feature .scenario .steps li.undefined,.content .feature .scenario .steps li.pending{color:#d0c401;list-style-type:'\\00003F'}";
	html += ".content .feature .scenario .steps li.skipped{color:#ccc;list-style-type:'\\002D'}";
	html += "</style>";
	html += "<script src=\"https://code.jquery.com/jquery-3.5.0.slim.min.js\" integrity=\"sha256-MlusDLJIP1GRgLrOflUQtshyP0TwT/RHXsI1wWGnQhs=\" crossorigin=\"anonymous\"></script>";
	html += "</head>";
	html += "<body>";
	html += "<div class='global'>";
	let menu = `<div class='menu' id='main-menu'><h1>${title}</h1>${createMenu(report)}</div>`;
	if (logoPath != undefined) {

		menu = `<div class='menu' id='main-menu'><h1 class='logo'><img src='${logoPath}' alt='${title}' /></h1>${createMenu(report)}</div>`;

	}
	let content = `<div class='content'>${createContent(report)}</div>`;
	html += "</div>";
	html += `${menu + content}</body>`;
	html += "<script>\
$('.name.passed').siblings('.steps').hide();\
$('.name').on('click', switchSteps);\
\
function switchSteps(e){\
	console.log(e);\
	var targetName = e.currentTarget;\
	$(targetName).parent().find('.steps').toggle();\
}\
</script>";
	html += "<html>";

	fs.writeFile(filepath, html, (err) => {

		console.log(`CUCUMBER REPORT - html report created : ${filepath}`);

	});

};

function createMenu (json) {

	let menu = "";

	// We create an intermediate array
	let menuArray = [];
	json.forEach((feature, i) => {

		let levels = getLevels(feature);

		// console.log(levels);

		let curArrayLevel = menuArray;
		levels.forEach((level, i) => {

			level = level.charAt(0).toUpperCase() + level.slice(1);

			// If we reach the filename, we set the feature name instead
			if (level.match("\.feature") !== null) {

				level = `${feature.name}|${getAnchor(feature)}|${getFeatureStatus(feature)}`;

			}

			if (curArrayLevel[level] === undefined) {

				curArrayLevel[level] = [];

			}

			curArrayLevel = curArrayLevel[level];

		});

	});


	return createUlFromArray(menuArray);

}

function createUlFromArray (arrayForUl) {

	let ul = "<ul>";

	for (const name in arrayForUl) {

		if (name.indexOf("|") > -1) {

			let [
				lib,
				featureId,
				status
			] = name.split("|");
			ul += `<li class='${status}'><a href='#${featureId}'>${lib}</a></li>`;

		} else {

			ul += `<li>${name}</li>`;
			ul += createUlFromArray(arrayForUl[name]);

		}


	}

	ul += "</ul>";

	return ul;

}

function createContent (json) {

	let content = "";
	json.forEach((feature, i) => {

		// console.log(feature);
		let anchor = getAnchor(feature);
		let pathLib = getPathLib(feature);

		content += "<div class='feature'>";
		content += `<div class='title'><a name='${anchor}'>${pathLib}</a></div>`;

		feature.elements.forEach((scenario, i) => {

			let stepsContent = "";
			let scenarioNotPassedClass = " passed";
			scenario.steps.forEach((step, i) => {

				if (!step.hidden) {

					if (step.result.status != "passed") {

						scenarioNotPassedClass = " hasErrors";

					}

					stepsContent += "<ul class='steps'>";
					stepsContent += `<li class='${step.result.status}'>${step.name}</li>`;
					stepsContent += "</ul>";

				}

			});

			content += "<div class='scenario'>";
			content += `<div class='name${scenarioNotPassedClass}'>${scenario.name}</div>`;
			content += stepsContent;
			content += "</div>";

		});

		content += "</div>";

	});

	return content;

}

function getAnchor (feature) {

	if (feature.uri.indexOf("\\") > -1) { // Windows

		return feature.uri.replace(/\\/g, "").replace(".feature", "");

	} // Linux&Mac
	return feature.uri.replace(/\//g, "").replace(".feature", "");

}

function getPathLib (feature) {

	let pathLib = "";
	if (feature.uri.indexOf("\\") > -1) { // Windows

		pathLib = `${feature.uri.replace("features\\", "").replace(/\\[^\\]*.feature/, "").replace(/\\/g, " > ")} > ${feature.name}`;

	} else {

		// Linux&Mac
		pathLib = `${feature.uri.replace("features\/", "").replace(/\/[^\/]*.feature/, "").replace(/\//g, " > ")} > ${feature.name}`;

	}

	return pathLib.replace(/^[0-9]*_/, "").replace("_", " ");

}

function getLevels (feature) {

	let levels = [];
	let slashOrAnti = "\/"; // Linux&Mac
	if (feature.uri.indexOf("\\") > -1) { // Windows

		slashOrAnti = "\\";

	}

	// We remove the features dir
	levels = feature.uri.replace(`features${slashOrAnti}`, "");

	// We make it prettier
	levels = levels.replace(/^[0-9]*_/, "").replace("_", " ");

	return levels.split(slashOrAnti);

}

function getFeatureStatus (feature) {

	let status = "passed";
	feature.elements.forEach((scenario, i) => {

		scenario.steps.forEach((step, i) => {

			if (step.result.status == "undefined" || step.result.status == "pending") {

				status = "undefined";

			}
			if (status == "passed" && step.result.status == "failed") {

				status = "failed";

			}

		});

	});

	return status;

}
