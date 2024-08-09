/*

BASIC DETAILS: This file serves as the collection of all update associations functions.

   - checkForUpdate: Checks against the most recent release on github to determine if an update is available.
   - updateExec: Adds the back-end listener associated to executing the installer for the new update.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Checks against the most recent release on github to determine if an update is available.

	- os provides the means to get information on the user operating system.
    - https provides the means to download files.
    - fs and path provide the means to work with local files.
    - log provides the means to create application logs to keep track of what is going on.
    - dir is the directory containing the configuration files.
    - win is an object that represents the primary window of the Electron app.

*/
exports.checkForUpdate = (os, https, fs, path, log, dir, win) => {
	log.info("The application is checking for any available update.");
	// Check that the application is connected to the internet prior to checking for an available update.
	require("check-internet-connected")({ "timeout": 500, "retries": 5, "domain": "https://google.com" }).then(() => {
		// Define the options associated to the GET request for github releases.
		const options = { "host": "api.github.com", "path": "/repos/nathanmarianovsky/Trak/releases", "method": "GET", "headers": { "user-agent": "node.js" } };
		// Put the GET request in.
		const request = https.request(options, response => {
			// Define the holder for the fetched data.
			let body = "";
			// Update the holder as the data is fetched.
			response.on("data", chunk => body += chunk.toString("UTF8"));
			// Once the data has been fetched completely check the current app version against the latest in the github releases.
			response.on("end", () => {
				// Define the latest release from github.
			    const githubData = JSON.parse(body)[0];
			    // Read the location.json file to extract the location of the app installation location.
			    fs.readFile(path.join(dir, "Trak", "config", "location.json"), "UTF8", (resp, fl) => {
			    	// Define the current version of the app.
			    	const curVer = JSON.parse(fs.readFileSync(path.join(JSON.parse(fl).appLocation, "package.json"), "UTF8")).version;
			    	// If there was an issue reading the location.json file notify the user.
	                if(resp) {
	                	log.error("There was an issue reading the location.json file. Error Type: " + resp.name + ". Error Message: " + resp.message + ".");
	                	win.webContents.send("locationFileIssue");
	                }
	                // Compare the current version against the latest version on github to determine whether an update is available.
	                else if(require("semver").gt(githubData.tag_name.substring(1), curVer)) {
	                	log.info("The application has found a newer version available as a release on Github corresponding to version " + githubData.tag_name.substring(1) + ".");
	                	let fileName = "Trak-",
	                		ending = ""
	                		downloadURL = "";
	                	if(os.type() == "Windows_NT") { fileName += "Windows-"; ending = ".exe"; }
	                	else if(os.type() == "Linux") { fileName += "Linux-"; ending = ".snap"; }
	                	if(os.arch() == "x64") { fileName += "amd64" }
	                	else if(os.arch() == "arm64") { fileName += "arm64" }
	                	fileName += ending;
	                	for(let q = 0; q < githubData.assets.length; q++) {
	                		if(githubData.assets[q].name == fileName) {
	                			downloadURL = githubData.assets[q].browser_download_url;
	                			break;
	                		}
	                	}
	                	// With an update available send a request to the front-end to display the associated update button on the top nav.
	                	win.webContents.send("updateAvailable", [[githubData.html_url, githubData.tag_name.substring(1), curVer, githubData.body, downloadURL, fileName], JSON.parse(body).slice(1).map(entry => [entry.name, entry.body])]);
	                }
	            });
		    });
		});
		// End the HTTPS request.
		request.end();
	}).catch(err => {
		log.warn("The app failed to check for an update because it could not connect to the internet. More specifically, connecting to https://google.com failed at the address " + err.address + ":" + err.port + " with exit code " + err.code + ".");
	});
};



/*

Adds the back-end listener associated to executing the installer for the new update.

	- elec and ipcElec provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.

*/
exports.updateExec = (elec, path, fs, log, ipcElec) => {
	// Handles the download of an updated installer and launching it.
	ipcElec.once("appUpdate", (event, appUpdateData) => {
		// Define the path where the updated installer will download.
		const outputdir = path.join(require("os").homedir(), "TrakDownloads");
		// Create the TrakDownloads folder if it does not exist. If it does exist then empty it on load.
		if(!fs.existsSync(outputdir)) {
			log.info("Creating the TrakDownloads folder. To be located at " + outputdir);
			fs.mkdirSync(outputdir);
		}
		else {
			log.info("Emptying the TrakDownloads folder");
			fs.emptyDirSync(outputdir);
		}
		// Fetch the required asset from github.
		require("download-github-release")("nathanmarianovsky", "Trak", outputdir, release => release.prerelease === false, asset => asset.name == appUpdateData[1], false).then(() => {
		    // Notify the user that the app will close to proceed with the update.
		    const linkArr = appUpdateData[0].split("/");
		    log.info("The newest release of the application has finished downloading corresponding to version " + linkArr[linkArr.length - 2].split("v")[1] + ".");
		    event.sender.send("updateDownloadComplete");
		    // After a five second delay launch the updated installer and close the app.
		    setTimeout(() => {
				let child = require("child_process").spawn("cmd", ["/S /C " + appUpdateData[1]], {
					"detached": true,
					"cwd": outputdir,
					"env": process.env
				});
				log.info("The application is launching the updated release installer.");
				elec.quit();
		    }, 5000);
		}).catch(err => log.error("There was an issue in downloading the latest Github release of the application. Error Type: " + err.name + ". Error Message: " + err.message + "."));
	});
};



module.exports = exports;