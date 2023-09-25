/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - exportData: Create a zip file containing the exported library records.
   - importData: Reads a zip file and adds its content to the library records.
   - importDriverZIP: Iterates through the list of zip files to be imported by waiting for each one to finish prior to proceeding to the next one.
   - createTrayMenu: Create the system tray icon and menu.
   - createWindow: Executes the creation of the primary window with all necessary parameters.
   - tutorialLoad: Tells the front-end to load the application tutorial.
   - startCommandLineFolder: Provides the necessary command to execute the opening of a folder.
   - isURL: Tests whether a given string represents a url.
   - checkForUpdate: Checks against the most recent release on github to determine if an update is available.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Create a zip file containing the exported library records.

	- fs and path provide the means to work with local files.
	- zipper is a library object which can create zip files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- exportLocation is a string representing the location where the generated zip file will be placed.

*/ 
exports.exportData = (fs, path, zipper, eve, dir, exportLocation, records, compressionVal = false) => {
	// If the exportTemp folder does not exist, then create it.
	if(!fs.existsSync(path.join(dir, "Trak", "exportTemp"))) {
		fs.mkdirSync(path.join(dir, "Trak", "exportTemp"));
	}
	// Read the settings configuration file.
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
		// If there was an issue reading the settings configuration file notify the user.
		if(err) { eve.sender.send("configurationFileOpeningFailure");  }
		else {
			// Define the configuration file data and associated library records path.
			const fileData = JSON.parse(fileContent),
				dataPath = fileData.current != undefined ? fileData.current.path : fileData.original.path;
			// Copy over all library records which will be included in the export.
			let listPromise = new Promise((resolve, reject) => {
			    records.forEach((elem, index, arr) => {
					fs.copySync(path.join(dataPath, elem), path.join(dir, "Trak", "exportTemp", elem), { "overwrite": true });
					if(index == arr.length - 1) { resolve(); }
				});
			});
			// Once all necessary records have copied over, zip the records and compress if necessary.
			listPromise.then(() => {
				zipper.zip(path.join(dir, "Trak", "exportTemp"), (prob, zipped) => {
					// If there was an issue creating the zip file notify the user.
					if(prob) { eve.sender.send("exportZippingFailure"); }
					else {
						// Define the zip file name.
						let zipStr = "Trak-Export-";
						// Compress the zip file if requested.
						if(compressionVal == true) {
							zipStr += "Compressed-";
							zipped.compress();
						}
						zipStr += (new Date().toJSON().slice(0, 10).replace(/-/g, ".")) + ".zip";
						// Delete a previous export if it exists for the current day.
						let deletePromise = new Promise((resolve, reject) => {
							if(fs.existsSync(path.join(exportLocation, zipStr))) {
								fs.unlink(path.join(exportLocation, zipStr), delErr => {
									if(delErr) { eve.sender.send("exportZipFileDeleteFailure"); }
									else { resolve(); }
								});
							}
							else { resolve(); }
						});
						// Save the zip file, empty the exportTemp folder, and notify the user that the export process has finished.
						deletePromise.then(() => {
							zipped.save(path.join(exportLocation, zipStr), zipErr => {
								if(zipErr) { eve.sender.send("exportZipFileFailure"); }
								else {
									fs.emptyDirSync(path.join(dir, "Trak", "exportTemp"));
									eve.sender.send("exportZipFileSuccess", exportLocation);
								}
							});
						});
					}
				});
			});
		}
	});
};



/*

Reads a zip file and adds its content to the library records.

	- fs and path provide the means to work with local files.
	- ipc provides the means to operate the Electron app.
	- zipper is a library object which can create zip files.
	- win is an object referencing the primary window of the Electron app.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- zipFile is the zip file to be imported.

*/ 
exports.importData = async (fs, path, ipc, zipper, win, eve, dir, zipFile) => {
	return new Promise((res, rej) => {
		// If the exportTemp folder does not exist, then create it.
		if(!fs.existsSync(path.join(dir, "Trak", "importTemp"))) {
			fs.mkdirSync(path.join(dir, "Trak", "importTemp"));
		}
		// Read the settings configuration file.
		fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
			// If there was an issue reading the settings configuration file notify the user.
			if(err) { eve.sender.send("configurationFileOpeningFailure");  }
			else {
				// Define the configuration file data and associated library records path.
				const fileData = JSON.parse(fileContent).current != undefined ? JSON.parse(fileContent).current.path : JSON.parse(fileContent).original.path;
				// Unzip the zip file.
				zipper.unzip(zipFile, (er, unzipped) => {
					// If there was an issue unzipping the zip file notify the user.
					if(er) { eve.sender.send("importUnzippingFailure", zipFile); }
					else {
						// Save the contents of the zip file to the importTemp folder.
						unzipped.save(path.join(dir, "Trak", "importTemp"), issue => {
							// If there was an issue saving the contents of the zip file notify the user.
							if(issue) { eve.sender.send("importZipFileFailure", zipFile); }
							else {
								// Compare the list of records in the zip file and compare them to the current library records to see which reference the same record.
								let list = fs.readdirSync(path.join(dir, "Trak", "importTemp")).filter(file => fs.statSync(path.join(path.join(dir, "Trak", "importTemp"), file)).isDirectory()),
									listFilterDoExist = list.filter(elem => fs.existsSync(path.join(fileData, elem))),
									listFilterDoNotExist = list.filter(elem => !fs.existsSync(path.join(fileData, elem)));
								// If there are records being imported which do not exist in the current library records simply copy them over.
								if(listFilterDoNotExist.length > 0) {
									listFilterDoNotExist.forEach(elem => { fs.moveSync(path.join(dir, "Trak", "importTemp", elem), path.join(fileData, elem)); });
								}
								// If there are no records being imported which do exist in the current library records then empty the importTemp folder, reload the primary window, and notify the user that the zip file has been imported.
								if(listFilterDoExist.length == 0) {
									fs.emptyDirSync(path.join(dir, "Trak", "importTemp"));
									win.reload();
									setTimeout(() => { res(); win.webContents.send("importZipFileSuccess", zipFile); }, 1000);
								}
								else {
									// If there are records being imported which do exist in the current library records notify the user.
									eve.sender.send("importRecordExists", listFilterDoExist);
									// Once the user chooses which records to overwrite proceed by copying them from the importTemp folder.
									ipc.once("importOveride", (event, overwriteList) => {
										let savePromise = new Promise((resolve, reject) => {
										    overwriteList.forEach((elem, index, arr) => {
												if(elem.overwrite == true) {
													fs.moveSync(path.join(dir, "Trak", "importTemp", elem.record), path.join(fileData, elem.record));
												}
												if(index == arr.length - 1) { resolve(); }
											});
										});
										// Once the desired records have been overwritten empty the importTemp folder, reload the primary window, and notify the user that the zip file has been imported.
										savePromise.then(() => {
											fs.emptyDirSync(path.join(dir, "Trak", "importTemp"));
											win.reload();
											setTimeout(() => { res(); win.webContents.send("importZipFileSuccess", zipFile); }, 1000);
										});
									});
								}
							}
						});
					}
				});
			}
		});
	});
};



/*

Iterates through the list of zip files to be imported by waiting for each one to finish prior to proceeding to the next one.

	- fs and path provide the means to work with local files.
	- ipc provides the means to operate the Electron app.
	- zipper is a library object which can create zip files.
	- mainWin is an object referencing the primary window of the Electron app.
	- ogPath is a string representing the base directory corresponding to the location of the configuration file.
	- evnt is the object which allows for interaction with the fron-end of the Electron application.
	- lst is the list of zip files to be imported.

*/ 
exports.importDriverZIP = async (fs, path, ipc, zipper, mainWin, ogPath, evnt, lst) => {
  	for(let i = 0; i < lst.length; i++) {
    	await exports.importData(fs, path, ipc, zipper, mainWin, evnt, ogPath, lst[i]);
  	}
};



/*

Create the system tray icon and menu.

	- mode is either "h" or "s" depending on whether the system icon menu should have the option to hide or show the app.
	- win is an object that represents the primary window of the Electron app.
	- trayObj and Menu are objects provided by the Electron app to handle the loading of the app tray and menu.

*/ 
exports.createTrayMenu = (mode, win, trayObj, Menu) => {
	const label = (mode == "h" ? "Hide" : "Show");
	trayObj.setToolTip("Trak");
	trayObj.setContextMenu(Menu.buildFromTemplate([
		{ "label": label, click: () => {
			if(mode == "h") {
				win.hide();
				exports.createTrayMenu("s", win, trayObj, Menu);
			}
			else {
				win.show();
				exports.createTrayMenu("h", win, trayObj, Menu);
			}
		}},
		{ "label": "Quit", "role": "quit" }
	]));
};


/*

Executes the creation of the primary window with all necessary parameters.

	- extension refers to the html file name.
	- dir is the directory containing the display pages.
	- BrowserWindow provides the means to create a new app window.
	- width and height are the physical parameters for describing the created window size.
	- fullscreen is a boolean representing whether the window should be maximized on launch.
	- resizable is a boolean representing whether a window should be allowed to rescale.

*/
exports.createWindow = (extension, dir, BrowserWindow, path, width = 1000, height = 800, fullscreen = false, resizable = true) => {
  	let win = new BrowserWindow({
		"width": width,
    	"height": height,
    	"autoHideMenuBar": true,
    	"center": true,
    	"resizable": resizable,
    	"webPreferences": {
    		"nodeIntegration": true,
    		"contextIsolation": false
    	},
    	"icon": __dirname + "/assets/favicon.ico"
	});
	win.loadFile(path.join(dir, "Trak", "localPages", extension + ".html"));
	if(fullscreen == true) { win.maximize(); }
  	return win;
};



/*

Tells the front-end to load the application tutorial.

	- fs and path provide the means to work with local files.
	- win is the primary window of the app.
	- sysPath is the system location for the application configuration.

*/
exports.tutorialLoad = (fs, path, win, sysPath) => {
	if(!fs.existsSync(path.join(sysPath, "Trak", "config", "tutorial.json"))) {
		win.webContents.send("introduction", false);
	}
	else {
		const intro = JSON.parse(fs.readFileSync(path.join(sysPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction;
		if(intro == true) {
			win.webContents.send("introduction", true);
		}
	}
};



/*

Provides the necessary command to execute the opening of a folder.

*/
exports.startCommandLineFolder = () => {
    switch(process.platform) { 
      	case "darwin" : return "open";
      	case "win32" : return "explorer";
      	case "win64" : return "explorer";
  		default : return "xdg-open";
   }
};



/*

Tests whether a given string represents a url.

    - url is the string to be tested.

*/
exports.isURL = url => {
    const urlRegEx = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegEx.test(url);
};



/*

Extracts the filename from a given string representing a url.

    - url is the path corresponding to a file.

*/
exports.parseURLFilename = url => new URL(url, "https://example.com").href.split("#").shift().split("?").shift().split("/").pop();



/*

Checks against the most recent release on github to determine if an update is available.

	- os provides the means to get information on the user operating system.
	- semver provides the means to compare semantic versioning.
    - https provides the means to download files.
    - fs and path provide the means to work with local files.
    - dir is the directory containing the configuration files.
    - win is an object that represents the primary window of the Electron app.

*/
exports.checkForUpdate = (os, semver, https, fs, path, dir, win) => {
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
                if(resp) { win.webContents.send("locationFileIssue"); }
                // Compare the current version against the latest version on github to determine whether an update is available.
                else if(semver.gt(githubData.tag_name.substring(1), curVer)) {
                	let fileName = "Trak-",
                		ending = ""
                		downloadURL = "";
                	if(os.type() == "Windows_NT") { fileName += "Windows-"; ending = ".msi"; }
                	else if(os.type() == "Linux") { fileName += "Linux-"; ending = ".deb"; }
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
                	win.webContents.send("updateAvailable", [githubData.html_url, githubData.tag_name.substring(1), curVer, githubData.body, downloadURL, fileName]);
                }
            });
	    });
	});
	// End the HTTPS request.
	request.end();
};



module.exports = exports;