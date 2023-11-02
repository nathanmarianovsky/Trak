/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - writeDataFile: Handles the writing of files associated to a record.
   - objCreationImgs: Downloads images associated to a record and returns an array to their location.
   - animeObjCreation: Creates an object associated to an anime record in order to save/update.
   - bookObjCreation: Creates an object associated to a book record in order to save/update.
   - animeSave: Handles the saving of an anime record by creating the associated folders and data file.
   - bookSave: Handles the saving of a book record by creating the associated folders and data file.
   - animeUpdate: Handles the update of an anime record.
   - bookUpdate: Handles the update of a book record.
   - removeRecords: Handles the removal of records by deleting the associated folders and data file.
   - updateSettings: Handles the update of all settings files.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles the writing of files associated to a record.

	- log provides the means to create application logs to keep track of what is going on.
	- globalWin is an object representing the app's primary window.
	- curWin is an object representing the current window of the Electron app.
	- writeData is an object representing the data that is to be written to the data.json file.
	- mode is a string representing whether a record is being added or updated.
	- savePath is the path to the local user data.
	- fs and path provide the means to work with local files.
	- evt provides the means to interact with the front-end of the Electron app.
	- info is the data associated to the record.

*/
exports.writeDataFile = (log, globalWin, curWin, writeData, mode, savePath, fs, path, evt, info) => {
	let fldr = "";
	const modeStr = (mode == "A" ? "add" : "update");
	if(info[0] == "Anime") {
		fldr = (info[0] + "-" + (info[1] != "" ? info[1] : info[2])).replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("");
	}
	else if(info[0] == "Book") {
		fldr = info[0] + "-" + info[3] + "-" + info[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("");
	}
	fs.writeFile(path.join(savePath, "Trak", "data", fldr, "data.json"), JSON.stringify(writeData), "UTF8", err => {
		// If there was an error in writing to the data file, then notify the user.
		if(err) {
			if(info[0] == "Anime") {
				log.error("There was an issue in writing the data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]));
				evt.sender.send("writeRecordFailure", fldr);
			}
			if(info[0] == "Book") {
				log.error("There was an issue in writing the data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]));
				evt.sender.send("writeRecordFailure", info[0] + "-" + (info[1] != "" ? info[1] : info[3]));
			}
		}
		else {
			if(info[0] == "Anime") {
				log.info("The data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]) + " has been successfully " + (modeStr == "A" ? "created and saved." : "updated."));
			}
			else if(info[0] == "Book") {
				log.info("The data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]) + " has been successfully " + (modeStr == "A" ? "created and saved." : "updated."));
			}
			// Copy over the files asked to be added as assets in association to a particular record.
			let i = 0;
			for(; i < info[10].length; i++) {
				let dest = path.join(savePath, "Trak", "data", fldr, "assets", path.basename(info[10][i]));
				fs.copyFile(info[10][i], dest, err => {
					if(err) {
						log.error("There was an error in copying over the file " + info[10][i] + " as an asset.");
						evt.sender.send("copyFailure", info[10][i]);
					}
				});
			}
			// Once all of the files have been updated, notify the user everything has been taken care of and close the window.
			if(i == info[10].length) {
				if(info[0] == "Anime") {
					log.info("All assets associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]) + " have been copied over.");
				}
				else if(info[0] == "Book") {
					log.info("All assets associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]) + " have been copied over.");
				}
				globalWin.reload();
				if(info[0] == "Anime") {
					curWin.webContents.send(modeStr + "RecordSuccess", fldr);
				}
				else if(info[0] == "Book") {
					curWin.webContents.send(modeStr + "RecordSuccess", info[0] + "-" + (info[1] != "" ? info[1] : info[3]));
				}
				setTimeout(() => { curWin.destroy(); }, 2000);
			}
		}
	});
};



/*

Downloads images associated to a record and returns an array to their location.

	- path and fs provide the means to work with local files.
	- https provides the means to download files.
	- tools provides a collection of local functions.
	- dir is the path to the local user data.
	- recordDir is the folder name associated to the record.
	- providedImgs is the image data provided by the front-end user submission for record save/update.

*/
exports.objCreationImgs = (path, fs, https, tools, dir, recordDir, providedImgs) => {
	let imgArr = [];
	if(providedImgs[0] == false && providedImgs[1][0] != "") {
		for(let y = 0; y < providedImgs[1].length; y++) {
			if(tools.isURL(providedImgs[1][y])) {
				let downloadFilePath = path.join(dir, "Trak", "data", recordDir, "assets", tools.parseURLFilename(providedImgs[1][y]));
		        imgArr.push(downloadFilePath);
				https.get(providedImgs[1][y], res => {
				    let filePath = fs.createWriteStream(downloadFilePath);
				    res.pipe(filePath);
				    filePath.on("finish", () => { filePath.close(); });
				});
			}
			else {
				let copyFilePath = path.join(dir, "Trak", "data", recordDir, "assets", providedImgs[1][y].replace(/^.*[\\\/]/, ""));
				if(providedImgs[1][y] != copyFilePath) {
					fs.copySync(providedImgs[1][y], copyFilePath);
				}
				imgArr.push(copyFilePath);
			}
		}
	}
	else { imgArr = providedImgs[1]; }
	return imgArr;
};



/*

Creates an object associated to an anime record in order to save/update.

	- path and fs provide the means to work with local files.
	- https provides the means to download files.
	- tools provides a collection of local functions.
	- dir is the path to the local user data.
	- providedData is the data provided by the front-end user submission for anime record save/update.

*/
exports.animeObjCreation = (path, fs, https, tools, dir, providedData) => {
	const animeObj = {
		"category": providedData[0],
		"name": providedData[1],
		"jname": providedData[2],
		"review": providedData[3],
		"directors": providedData[4],
		"producers": providedData[5],
		"writers": providedData[6],
		"musicians": providedData[7],
		"studio": providedData[8],
		"license": providedData[9],
		"genres": providedData[11],
		"synopsis": providedData[13],
		"img": exports.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + (providedData[1] != "" ? providedData[1] : providedData[2]).replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), providedData[14]),
		"content": []
	};
	for(let m = 0; m < providedData[12].length; m++) {
		if(providedData[12][m][0] == "Single") {
			animeObj.content.push({
				"scenario": providedData[12][m][0],
				"name": providedData[12][m][1],
				"type": providedData[12][m][2],
				"release": providedData[12][m][3],
				"watched": providedData[12][m][4],
				"rating": providedData[12][m][5],
				"review": providedData[12][m][6]
			});
		}
		else if(providedData[12][m][0] == "Season") {
			let animeSeasonObj = {
				"scenario": providedData[12][m][0],
				"name": providedData[12][m][1],
				"start": providedData[12][m][2],
				"end": providedData[12][m][3],
				"status": providedData[12][m][4],
				"episodes": []
			};
			for(let n = 0; n < providedData[12][m][5].length; n++) {
				animeSeasonObj.episodes.push({
					"name": providedData[12][m][5][n][0],
					"watched": providedData[12][m][5][n][1],
					"rating": providedData[12][m][5][n][2],
					"review": providedData[12][m][5][n][3]
				});
			}
			animeObj.content.push(animeSeasonObj);
		}
	}
	return animeObj;
};



/*

Creates an object associated to a book record in order to save/update.

	- path and fs provide the means to work with local files.
	- https provides the means to download files.
	- tools provides a collection of local functions.
	- dir is the path to the local user data.
	- providedData is the data provided by the front-end user submission for book record save/update.

*/
exports.bookObjCreation = (path, fs, https, tools, dir, providedData) => {
	return {
		"category": providedData[0],
		"name": providedData[1],
		"originalName": providedData[2],
		"isbn": providedData[3],
		"authors": providedData[4],
		"publisher": providedData[5],
		"publicationDate": providedData[6],
		"pages": providedData[7],
		"lastRead": providedData[8],
		"media": providedData[9],
		"synopsis": providedData[11],
		"rating": providedData[12],
		"review": providedData[13],
		"genres": providedData[14],
		"img": exports.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + providedData[3] + "-" + providedData[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), providedData[15])
	};
};



/*

Handles the saving of an anime record by creating the associated folders and data file.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- https provides the means to download files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- tools provides a collection of local functions.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.animeSave = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
	// Check to see that the folder associated to the new record does not exist.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""))) && !fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[2].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")))) {
		// Create a new directory for the assets associated to the new record.
		const assetsPath = path.join(dataPath, "Trak", "data", data[0] + "-" + (data[1] != "" ? data[1] : data[2]).replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), "assets");
		log.info("Creating the assets directory for the new anime record. To be located at " + assetsPath);
		fs.mkdirSync(assetsPath, { "recursive": true });
		exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "A", dataPath, fs, path, evnt, data);
	}
	else {
		log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[2]) + " already exists!");
		evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[2]));
	}
};



/*

Handles the saving of a book record by creating the associated folders and data file.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- https provides the means to download files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- tools provides a collection of local functions.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.bookSave = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
	// Check to see that the folder associated to the new record does not exist.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")))) {
		// Create a new directory for the assets associated to the new record.
		const assetsPath = path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), "assets");
		log.info("Creating the assets directory for the new book record. To be located at " + assetsPath);
		fs.mkdirSync(assetsPath, { "recursive": true });
		exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "A", dataPath, fs, path, evnt, data);
	}
	else {
		log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[3]) + " already exists!");
		evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[3]));
	}
};



/*

Handles the update of an anime record.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- https provides the means to download files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- tools provides a collection of local functions.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.animeUpdate = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
	// If the name has been updated then change the associated record folder name.
	if((data[1] != "" && data[1] != data[data.length - 1]) || (data[1] == "" && data[2] != "" && data[2] != data[data.length - 1])) {
		fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + data[data.length - 1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")), path.join(dataPath, "Trak", "data", data[0] + "-" + (data[1] != "" ? data[1] : data[2]).replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")), err => {
			// If there was an error in renaming the record folder notify the user.
			if(err) {
				log.error("There was an error in renaming the anime record folder " + data[data.length - 1] + " to " + (data[1] != "" ? data[1] : data[2]) + ".");
				evnt.sender.send("recordFolderRenameFailure", [data[data.length - 1], data[1] != "" ? data[1] : data[2]]);
			}
			// If no error occured in renaming the record folder write the data file, and copy over the file assets.
			else {
				exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
			}
		});
	}
	else {
		// Write the data file, and copy over the file assets.
		exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
	}
};



/*

Handles the update of a book record.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- https provides the means to download files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- tools provides a collection of local functions.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.bookUpdate = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
	// If the ISBN has been updated then change the associated record folder name.
	if(data[3] != data[data.length - 1][0] || data[1] != data[data.length - 1][1]) {
		fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + data[data.length - 1][0] + "-" + data[data.length - 1][1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")),
			path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")), err => {
			// If there was an error in renaming the record folder notify the user.
			if(err) {
				log.error("There was an error in renaming the book record folder " + (data[data.length - 1][1] != "" ? data[data.length - 1][1] : data[data.length - 1][0]) + " to " + (data[1] != "" ? data[1] : data[3]) + ".");
				evnt.sender.send("recordFolderRenameFailure", [data[data.length - 1][1] != "" ? data[data.length - 1][1] : data[data.length - 1][0], data[1] != "" ? data[1] : data[3]]);
			}
			// If no error occured in renaming the record folder write the data file, and copy over the file assets.
			else {
				exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
			}
		});
	}
	else {
		// Write the data file, and copy over the file assets.
		exports.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
	}
};



/*

Handles the removal of records by deleting the associated folders and data file.

	- log provides the means to create application logs to keep track of what is going on.
	- primaryWin is an object representing the current window of the Electron app.
	- userPath is the path to the local user data.
	- fs and path provide the means to work with local files.
	- data is a collection of record names.

*/
exports.removeRecords = (log, primaryWin, userPath, fs, path, data) => {
	// Once a confirmation has been provided by the user delete the associated record folders. 
	let j = 0;
	for(; j < data.length; j++) {
		fs.rm(path.join(userPath, "Trak", "data", data[j]), { "force": true, "recursive": true }, err => {
			// If there was an error in deleting the record folder notify the user.
			if(err) {
				log.error("There was an issue removing the data record associated to the " + data[j].split("-")[0].toLowerCase() + " " + data[j].substring(data[j].split("-")[0].length + 1) + ".");
				primaryWin.webContents.send("recordRemovalFailure", data[j]);
			}
		});
	}
	// Refresh the primary window and notify the user that all checked records have been removed.
	if(j == data.length) {
		log.info("The data records associated to the folders " + data.join(", ") + (data.length > 1 ? "have" : "has") + " been deleted.");
		primaryWin.reload();
		setTimeout(() => { primaryWin.webContents.send("recordsRemovalSuccess"); }, 500);
	}
};



/*

Handles the update of all settings files.

	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- app and ipc provide the means to operate the Electron app.
	- dataArr is the array submitted from the front-end to update the settings options.
	- appDirectory is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.

*/
exports.updateSettings = (fs, path, log, ipc, app, dataArr, appDirectory, evnt) => {
	// Define the new data to be saved for the settings configuration file.
	const writeData = {
		"path": dataArr[0],
		"primaryColor": dataArr[1],
		"secondaryColor": dataArr[2],
		"primaryWindowWidth": dataArr[3],
		"primaryWindowHeight": dataArr[4],
		"primaryWindowFullscreen": dataArr[5],
		"secondaryWindowWidth": dataArr[6],
		"secondaryWindowHeight": dataArr[7],
		"secondaryWindowFullscreen": dataArr[8]
	};
	// Read the settings tutorial.json file.
	fs.readFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), "UTF8", (er, tutorialFile) => {
		// If there was an issue reading the tutorial.json file notify the user.
		if(er) {
			log.error("There was an error in reading the tutorial configuration file.");
			evnt.sender.send("introductionFileReadFailure");
		}
		else {
			log.info("The tutorial configuration file has been successfully read.");
			// Define the tutorial boolean.
			const origIntro = JSON.parse(tutorialFile).introduction;
			// Write the tutorial.json file with the submitted data.
			fs.writeFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": dataArr[9] }), "UTF8", error => {
				// If there was an issue writing the tutorial.json file notify the user.
				if(error) {
					log.error("There was an error in updating the tutorial configuration file.");
					evnt.sender.send("introductionFileSaveFailure");
				}
				else {
					log.info("The tutorial configuration file has been successfully rewritten.");
					// If the tutorial data was changed notify the user that the file was successfully updated.
					if(origIntro != dataArr[9]) { evnt.sender.send("introductionFileSaveSuccess"); }
					// Read the settings configuration.json file.
					fs.readFile(path.join(appDirectory, "Trak", "config", "configuration.json"), (err, file) => {
						// If there was an issue in reading the configuration.json file notify the user.
				        if(err) {
				        	log.error("There was an error in reading the settings configuration file.");
				        	evnt.sender.send("configurationFileOpeningFailure");
				    	}
				        else {
				        	log.info("The settings configuration file has been successfully read.");
				        	// Define the settings configuration data.
				        	const configurationData = JSON.parse(file);
				        	// Delete the user records located in the previous location if requested.
				        	ipc.on("dataOriginalDelete", (eve, resp) => {
				        		// Only delete the previous user records if the user wants to.
					  			if(resp[0] == true) {
					  				// Remove the directory and all content in it.
					  				fs.rm(configurationData.current.path, { "forced": true, "recursive": true}, er => {
					  					// If there was an issue in removing the directory notify the user.
					  					if(er) {
					  						log.error("There was an error in deleting the original data associated to the records.");
					  						eve.sender.send("dataDeleteFailure");
					  					}
					  					else {
					  						log.info("The original data associated to the records has been successfully deleted.");
					  						// Properly define the previous primary and secondary colors.
					  						if(resp[1] == true) {
					  							writeData.previousPrimaryColor = configurationData.current.primaryColor;
				        						writeData.previousSecondaryColor = configurationData.current.secondaryColor;
					  						}
					  						else {
					  							writeData.previousPrimaryColor = configurationData.original.primaryColor;
					        					writeData.previousSecondaryColor = configurationData.original.secondaryColor;
					  						}
					  						configurationData.current = writeData;
					  						// Write the configuration.json file with the submitted data.
											fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
												// If there was an issue in writing the configuration.json notify the user.
												if(err) {
													log.error("There was an error writing the configuration file associated to the application settings.");
													eve.sender.send("configurationFileWritingFailure");
												}
												else {
													log.info("The application settings have been updated. The application will now restart.");
													// Notify the user that the configuration.json was successfully updated and restart the application.
													eve.sender.send("configurationFileWritingSuccess");
													setTimeout(() => {
														app.relaunch();
														app.exit();
													}, 2000);
												}
											});
					  					}
					  				});
					  			}
					  			else {
					  				// Properly define the previous primary and secondary colors.
					  				if(resp[1] == true) {
			  							writeData.previousPrimaryColor = configurationData.current.primaryColor;
			    						writeData.previousSecondaryColor = configurationData.current.secondaryColor;
			  						}
			  						else {
			  							writeData.previousPrimaryColor = configurationData.original.primaryColor;
			        					writeData.previousSecondaryColor = configurationData.original.secondaryColor;
			  						}
			  						configurationData.current = writeData;
			  						// Write the configuration.json file with the submitted data.
									fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
										// If there was an issue in writing the configuration.json notify the user.
										if(err) {
											log.error("There was an error writing the configuration file associated to the application settings.");
											eve.sender.send("configurationFileWritingFailure");
										}
										else {
											log.info("The application settings have been updated. The application will now restart.");
											// Notify the user that the configuration.json was successfully updated and restart the application.
											eve.sender.send("configurationFileWritingSuccess");
											setTimeout(() => {
												app.relaunch();
												app.exit();
											}, 2000);
										}
									});
					  			}
					  		});
					  		// If the current parameters do not exist then compare the provided options to the original parameters.
				        	if(configurationData.current == undefined) {
				        		// If the provided options are the same as the original parameters then write the configuration.json file, but do not restart the app.
				        		if(configurationData.original.path == writeData.path && configurationData.original.primaryColor == writeData.primaryColor
				        			&& configurationData.original.secondaryColor == writeData.secondaryColor && configurationData.original.primaryWindowWidth == writeData.primaryWindowWidth
				        			&& configurationData.original.primaryWindowHeight == writeData.primaryWindowHeight && configurationData.original.secondaryWindowWidth == writeData.secondaryWindowWidth
				        			&& configurationData.original.secondaryWindowHeight == writeData.secondaryWindowHeight && configurationData.original.primaryWindowFullscreen == writeData.primaryWindowFullscreen
				        			&& configurationData.original.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && origIntro == dataArr[9]) {
				        			writeData.previousPrimaryColor = configurationData.original.primaryColor;
					        		writeData.previousSecondaryColor = configurationData.original.secondaryColor;
					        		configurationData.current = writeData;
					        		// Write the configuration.json file with the submitted data.
									fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
										// If there was an issue in writing the configuration.json notify the user.
										if(err) {
											log.error("There was an error writing the configuration file associated to the application settings.");
											evnt.sender.send("configurationFileWritingFailure");
										}
										else {
											log.info("The application settings have been updated.");
											evnt.sender.send("configurationFileWritingSuccessSimple");
										}
									});
				        		}
				        		// If the provided options are not the same as the original parameters then write the configuration.json file and restart the app.
				        		else {
				        			// If the provided data path is the same then proceed by writing the configuration.json file and restarting the app.
					        		if(configurationData.original.path == writeData.path) {
						        		writeData.previousPrimaryColor = configurationData.original.primaryColor;
						        		writeData.previousSecondaryColor = configurationData.original.secondaryColor;
						        		configurationData.current = writeData;
						        		// Write the configuration.json file with the submitted data.
										fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
											// If there was an issue in writing the configuration.json notify the user.
											if(err) {
												log.error("There was an error writing the configuration file associated to the application settings.");
												evnt.sender.send("configurationFileWritingFailure");
											}
											else {
												log.info("The application settings have been updated. The application will now restart.");
												// Notify the user that the configuration.json was successfully updated and restart the application.
												evnt.sender.send("configurationFileWritingSuccess");
												setTimeout(() => {
													app.relaunch();
													app.exit();
												}, 2000);
											}
										});
					        		}
					        		// If the provided data path is different than the original path then proceed by copying the user records and asking if they would like to remove the original directory.
					        		else {
					        			fs.copy(configurationData.current.path, path.join(writeData.path), err => {
										  	if(err) {
										  		log.error("There was an error in copying the original data associated to the records.");
										  		event.sender.send("dataCopyFailure");
										  	}
										  	else {
										  		log.info("The user is being asked on whether they would like to delete the library records data in the previous save location.");
										  		event.sender.send("dataOriginalDeleteAsk", false);
										 	}
										});
					        		}
				        		}
				        	}
				        	// If the current parameters do exist then compare the provided options to them.
				        	else {
				        		// If the provided options are the same as the current parameters then write the configuration.json file, but do not restart the app.
				        		if(configurationData.current.path == writeData.path && configurationData.current.primaryColor == writeData.primaryColor
				        			&& configurationData.current.secondaryColor == writeData.secondaryColor && configurationData.current.primaryWindowWidth == writeData.primaryWindowWidth
				        			&& configurationData.current.primaryWindowHeight == writeData.primaryWindowHeight && configurationData.current.secondaryWindowWidth == writeData.secondaryWindowWidth
				        			&& configurationData.current.secondaryWindowHeight == writeData.secondaryWindowHeight && configurationData.current.primaryWindowFullscreen == writeData.primaryWindowFullscreen
				        			&& configurationData.current.secondaryWindowFullscreen == writeData.secondaryWindowFullscreen && origIntro == dataArr[9]) {
				        			writeData.previousPrimaryColor = configurationData.current.primaryColor;
					        		writeData.previousSecondaryColor = configurationData.current.secondaryColor;
					        		configurationData.current = writeData;
					        		// Write the configuration.json file with the submitted data.
									fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
										// If there was an issue in writing the configuration.json notify the user.
										if(err) {
											log.error("There was an error writing the configuration file associated to the application settings.");
											evnt.sender.send("configurationFileWritingFailure");
										}
										else {
											log.info("The application settings have been updated.");
											evnt.sender.send("configurationFileWritingSuccessSimple");
										}
									});
				        		}
				        		// If the provided options are not the same as the current parameters then write the configuration.json file and restart the app.
				        		else {
					        		if(configurationData.current.path == writeData.path) {
					        			writeData.previousPrimaryColor = configurationData.current.primaryColor;
					        			writeData.previousSecondaryColor = configurationData.current.secondaryColor;
					        			configurationData.current = writeData;
					        			// Write the configuration.json file with the submitted data.
										fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
											// If there was an issue in writing the configuration.json notify the user.
											if(err) {
												log.error("There was an error writing the configuration file associated to the application settings.");
												evnt.sender.send("configurationFileWritingFailure");
											}
											else {
												log.info("The application settings have been updated. The application will now restart.");
												// Notify the user that the configuration.json was successfully updated and restart the application.
												evnt.sender.send("configurationFileWritingSuccess")
												setTimeout(() => {
													app.relaunch();
													app.exit();
												}, 2000);
											}
										});
					        		}
					        		// If the provided data path is different than the current path then proceed by copying the user records and asking if they would like to remove the current directory.
					        		else {
					        			fs.copy(configurationData.current.path, path.join(writeData.path), err => {
										  	if(err) {
										  		log.error("There was an error in copying the original data associated to the records.");
										  		evnt.sender.send("dataCopyFailure");
										  	}
										  	else {
										  		log.info("The user is being asked on whether they would like to delete the library records data in the previous save location.");
										  		evnt.sender.send("dataOriginalDeleteAsk", true);
										  	}
										});
					        		}
				        		}
				        	}
				        }
					});
				}
			});
		}
	});
};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- os provides the means to get information on the user operating system.
	- spawn provides the means to launch an update via an installer.
	- https provides the means to download files.
	- tools provides a collection of local functions.
	- malScraper provides the means to attain anime and manga records from myanimelist.
	- GoodReadsScraper provides the means to attain book records from goodreads.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- exec and shell provide the means to open files, folders, and links.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, BrowserWindow, path, fs, log, os, spawn, https, exec, shell, ipc, tools, malScraper, GoodReadsScraper, updateCondition, mainWindow, dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
   		let win = tools.createWindow("index", originalPath, BrowserWindow, path, log, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
   		win.webContents.on("did-finish-load", () => {
  				win.webContents.send("loadRows", win.getContentSize()[1] - 800);
  				tools.tutorialLoad(fs, path, log, win, originalPath);
  				if(updateCondition == false) {
  					tools.checkForUpdate(os, https, fs, path, log, originalPath, win);
  					updateCondition = true;
  				}
  			});
    	}
  	});

  	// Close the Electron app if the primary window is closed.
	let logCheck = false;
  	mainWindow.on("close", () => {
  		if(logCheck == false) {
  			log.info("The application is quitting.");
  			logCheck = true;
  		}
    	mainWindow = null;
    	app.quit();
    });

  	// Handle the load of the home page.
  	ipc.on("home", event => {
  		mainWindow.loadFile(path.join(originalPath, "Trak", "localPages", "index.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
  			mainWindow.webContents.send("loadRows", mainWindow.getContentSize()[1] - 800);
  			tools.tutorialLoad(fs, path, log, mainWindow, originalPath);
  		});
  	});

  	// Handles the saving of the tutorial.json file.
   	ipc.on("introductionFileSave", (event, launchIntro) => {
    	if(!fs.existsSync(path.join(originalPath, "Trak", "config", "tutorial.json"))) {
	    	fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) { 
	    			log.error("There was an error in saving the tutorial configuration file.");
	    			event.sender.send("introductionFileSaveFailure");
	    		}
	    		else {
	    			log.info("The tutorial configuration file has been updated.");
	    		}
	    	});
    	}
    	else if(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction != launchIntro) {
    		fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) {
	    			log.error("There was an error in saving the tutorial configuration file.");
	    			event.sender.send("introductionFileSaveFailure");
	    		}
	    		else {
	    			log.info("The tutorial configuration file has been updated.");
	    			event.sender.send("introductionFileSaveSuccess");
	    		}
	    	});
    	}
   	});

  	// Handle the opening of the github link on the about section.
  	ipc.on("aboutGithub", event => {
  		log.info("Opening the Github project page in the default browser.");
  		shell.openExternal("https://github.com/nathanmarianovsky/Trak");
  	});

  	// Handle the opening of the github release link on the update modal.
  	ipc.on("githubRelease", (event, url) => {
  		log.info("Opening the update release page in the default browser.");
  		shell.openExternal(url);
  	});

  	// Handles the opening of the zip import sample directory.
  	ipc.on("importSampleZIP", event => {
  		exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples"));
  		log.info("The directory containg the sample zip import has been opened.");
		event.sender.send("importSampleZIPSuccess");
  	});

  	// Handles the opening of the simple xlsx import sample directory.
  	ipc.on("importSampleSimpleXLSX", event => {
  		exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Simple-XLSX-Export-Sample"));
  		log.info("The directory containg the sample simple xlsx import has been opened.");
		event.sender.send("importSampleSimpleXLSXSuccess");
  	});

  	// Handles the opening of the detailed xlsx import sample directory.
  	ipc.on("importSampleDetailedXLSX", event => {
  		exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Detailed-XLSX-Export-Sample"));
  		log.info("The directory containg the sample detailed xlsx import has been opened.");
		event.sender.send("importSampleDetailedXLSXSuccess");
  	});

  	// Handles the load of the addRecord.html page for the creation of a record.
  	ipc.on("addLoad", (event, scenario) => {
  		let addWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		addWindow.webContents.on("did-finish-load", () => {
  			if(scenario == true) {
  				log.info("Loading the application tutorial for the addRecord.html page.");
  				addWindow.webContents.send("addIntroduction");
  			}
  			addWindow.webContents.send("addRecordInitialMessage");
  			ipc.once("performSave", (event, submission) => {
				// If the record is an anime then save the corresponding data.
				if(submission[0] == "Anime") {
	  				exports.animeSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
				}
				else if(submission[0] == "Book") {
					exports.bookSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
				}
  			});
  		});
  	});

  	// Handles the load of the addRecord.html page for the update of a record.
  	ipc.on("updateRecord", (event, fldrName) => {
  		let recordUpdateWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		recordUpdateWindow.webContents.on("did-finish-load", () => {
  			recordUpdateWindow.webContents.send("recordUpdateInfo", fldrName);
  			ipc.once("performSave", (event, submission) => {
				if(submission[0] == "Anime") {
  					exports.animeUpdate(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
  				}
  				else if(submission[0] == "Book") {
  					exports.bookUpdate(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
  				}
  			});
  		});
  	});

  	// Handles the deletion of multiple records.
  	ipc.on("removeRecords", (event, list) => {
  		exports.removeRecords(log, BrowserWindow.getFocusedWindow(), dataPath, fs, path, list);
  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, params) => {
		exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", params[0], "assets"));
		log.info("The application successfully opened the folder directory " + path.join(dataPath, "Trak", "data", params[0], "assets") + ".");
		event.sender.send("recordFilesSuccess", params[1]);
	});

	// Handles the saving of all options in the user settings.
	ipc.on("settingsSave", (event, submissionArr) => {
		exports.updateSettings(fs, path, log, ipc, app, submissionArr, originalPath, event);
	});

	// Handles the export of the chosen library records into a single zip file, possibly compressed, or a xlsx file containing the details along with a zip, possibly compressed, for the assets.
	ipc.on("databaseExport", (event, submission) => {
		if(submission[2] == "XLSX") {
			tools.exportDataXLSX(fs, path, log, require("zip-local"), require("exceljs"), event, originalPath, submission[0], submission[1], submission[3], submission[4]);
		}
		else if(submission[2] == "ZIP") {
			tools.exportDataZIP(fs, path, log, require("zip-local"), event, originalPath, submission[0], submission[1], submission[4]);
		}
	});

	// Handles the import of chosen zip xlsx files containing records into the library. Duplicate records are checked for.
	ipc.on("databaseImport", (event, submission) => {
		if(submission[1] == "XLSX") {
			tools.importDriverXLSX(fs, path, log, ipc, require("zip-local"), require("exceljs"), mainWindow, originalPath, event, submission[0], submission[2]);
		}
		else if(submission[1] == "ZIP") {
			tools.importDriverZIP(fs, path, log, ipc, require("zip-local"), mainWindow, originalPath, event, submission[0]);
		}
	});

	// Handles the download of an updated installer and launching it.
	ipc.once("appUpdate", (event, appUpdateData) => {
		// Define the path where the updated installer will download.
		const outputdir = path.join(os.homedir(), "TrakDownloads");
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
		    log.info("The newest release of the application has finished downloading.");
		    event.sender.send("updateDownloadComplete");
		    // After a five second delay launch the updated installer and close the app.
		    setTimeout(() => {
				let child = spawn("cmd", ["/S /C " + appUpdateData[1]], {
					"detached": true,
					"cwd": outputdir,
					"env": process.env
				});
				log.info("The application is launching the updated release installer.");
				app.quit();
		    }, 5000);
		}).catch(err => log.error("There was an issue in downloading the latest Github release of the application."));
	});

	// Handles the search of a string through all possible anime listings on myanimelist.
	ipc.on("animeSearch", (event, search) => {
		// Use the MAL scraper to fetch anime listings possibly matching what the user is looking for.
		malScraper.getResultsFromSearch(search[1], "anime").then(data => {
			log.info("MyAnimeList-Scraper has finished getting the search results for the query " + search[1] + ".");
			// Send the attained data to the front-end.
			event.sender.send("animeSearchResults", [search[0], search[1], data.map(elem => [elem.name, elem.image_url])]);
		}).catch(err => log.error("There was an issue in obtaining the anime search results for autocomplete options associated to the query " + search[1] + "."));
	});

	// Handles the search of a string through all possible book listings on goodreads.
	ipc.on("bookSearch", (event, search) => {
		// Use the goodreads scraper to fetch book listings possibly matching what the user is looking for.
		GoodReadsScraper.searchBooks({ "q": search[1] }).then(data => {
			log.info("GoodReadsScraper has finished getting the search results for the query " + search[1] + ".");
			// Send the attained data to the front-end.
			event.sender.send("bookSearchResults", [search[0], search[1], data.books.map(elem => [elem.title, elem.coverLarge])]);
		}).catch(err => log.error("There was an issue in obtaining the book search results for autocomplete options associated to the query " + search[1] + "."));
	});

	// Handles the fetching of details for a given anime via its name.
	ipc.on("animeFetchDetails", (event, name) => {
		// Fetch anime details.
		malScraper.getInfoFromName(name, true, "anime").then(animeData => {
			// Define the parameters which will be passed to the front-end based on the details received.
			let startDate = "",
				endDate = "";
			const directorsArr = [],
				producersArr = [],
				writersArr = [],
				musicArr = [];
			// Properly define the start and end date of an anime listing on myanimelist.
			if(animeData.aired != undefined) {
				let splitArr = animeData.aired.split("to");
				startDate = splitArr[0];
				if(splitArr.length > 1) {
					endDate = splitArr[1];
				}
			}
			// Properly define the lists of directors, producers, writers, and music directors associated to the anime listing on myanimelist.
			animeData.staff.forEach(person => {
				person.role.split(", ").forEach(personRole => {
					if(personRole.toLowerCase().includes("director") && !personRole.toLowerCase().includes("sound")) {
						directorsArr.push(person.name.split(", ").reverse().join(" "));
					}
					if(personRole.toLowerCase().includes("producer")) {
						producersArr.push(person.name.split(", ").reverse().join(" "));
					}
					if(personRole.toLowerCase().includes("storyboard")) {
						writersArr.push(person.name.split(", ").reverse().join(" "));
					}
					if(personRole.toLowerCase().includes("sound") || person.role.toLowerCase().includes("music")) {
						musicArr.push(person.name.split(", ").reverse().join(" "));
					}
				});
			});
			// Fetch all possible images associated to the anime record.
			malScraper.getPictures({ "name": animeData.title, "id": animeData.id }).then(malImgArr => {
				// Send the attained data to the front-end.
				log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + name + ".");
				let allImgArr = malImgArr.map(pic => pic.imageLink);
				tools.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0);
				event.sender.send("animeFetchDetailsResult", [
					animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, allImgArr], startDate, endDate,
					animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
					animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
				]);
			}).catch(err => log.error("There was an issue in obtaining the pictures associated to the anime record " + name + "."));
		}).catch(err => log.error("There was an issue in obtaining the details associated to the anime name " + name + "."));
	});

	// Handles the fetching of details for a given book via its name.
	ipc.on("bookFetchDetailsByName", (event, name) => {
		// Fetch book search results.
		GoodReadsScraper.searchBooks({ "q": name }).then(bookSearchData => {
			// Define the item in the search results matching the name provided.
			let bookLst = bookSearchData.books.map(elem => elem.title),
				bookLstItem = bookSearchData.books[bookLst.indexOf(name)];
			// Fetch book details.
			GoodReadsScraper.getBook({ "url": "https://www.goodreads.com/en/book/show/" + bookLstItem.id }).then(bookData => {
				event.sender.send("bookFetchDetailsResult", [bookData.title, bookData.originalTitle, bookData.coverLarge,
					(bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
					bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres]);
			}).catch(err => log.error("There was an issue in obtaining the details associated to the book title " + name + " via the url " + bookLstItem.url + "."));
		}).catch(err => log.error("There was an issue in obtaining the details associated to the book title " + name + "."));
	});

	// Handles the fetching of details for a given book via its ASIN.
	ipc.on("bookFetchDetailsByASIN", (event, asin) => {
		// Fetch book search results.
		GoodReadsScraper.searchBooks({ "q": asin }).then(bookSearchData => {
			// Define the item in the search results matching the name provided.
			let bookLst = bookSearchData.books.map(elem => elem.title),
				bookLstItem = bookSearchData.books[0];
			// Fetch book details.
			GoodReadsScraper.getBook({ "url": "https://www.goodreads.com/en/book/show/" + bookLstItem.id }).then(bookData => {
				event.sender.send("bookFetchDetailsResult", [bookData.title, bookData.originalTitle, bookData.coverLarge,
					(bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
					bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres]);
			}).catch(err => log.error("There was an issue in obtaining the details associated to the book ASIN " + asin + " via the url " + bookLstItem.url + "."));
		}).catch(err => log.error("There was an issue in obtaining the details associated to the book ASIN " + asin + "."));
	});

	// Handles the fetching of details for a given book via its ISBN.
	ipc.on("bookFetchDetailsByISBN", (event, isbn) => {
		// Fetch book details.
		GoodReadsScraper.getBook({ "isbn": isbn }).then(bookData => {
			event.sender.send("bookFetchDetailsResult", [bookData.title, bookData.originalTitle, bookData.coverLarge,
				(bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
				bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres]);
		}).catch(err => log.error("There was an issue in obtaining the details associated to the book whose ISBN is " + isbn + "."));
	});

	// Handles the fetching of the primary window's current height in order to provide the necessary difference for the index page table height to be updated.
	ipc.on("getAppHeight", event => {
		event.sender.send("appHeight", mainWindow.getBounds().height - 800);
	});

	// Handles the fetching of anime releases based on the season.
	ipc.on("animeFetchSeason", (event, seasonInfo) => {
		// Fetch the season releases.
		malScraper.getSeason(seasonInfo[0], seasonInfo[1]).then(data => {
			let seasonContent = [];
			// If a user does not choose a filter then show all types of releases by default.
			if(seasonInfo[2].length == 0) {
				const attributes = ["TV", "OVAs", "ONAs", "Movies", "Specials"];
				for(let a = 0; a < attributes.length; a++) {
					seasonContent = seasonContent.concat(data[attributes[a]]);
				}
			}
			// Otherwise only add the releases which adhere to the filters set by the user.
			else {
				for(let a = 0; a < seasonInfo[2].length; a++) {
					seasonContent = seasonContent.concat(data[seasonInfo[2][a]]);
				}
			}
			seasonContent.forEach(item => {
				item.genres = item.genres[0].split("\n").map(str => {
					str = str.trim();
					if(str == "Coming-of-Age") {
	                    str = "ComingOfAge";
	                }
	                else if(str == "Post-Apocalyptic") {
	                    str = "PostApocalyptic";
	                }
	                else if(str == "Sci-Fi") {
	                    str = "SciFi";
	                }
	                else if(str == "Slice of Life") {
	                    str = "SliceOfLife";
	                }
	                return str;
				}).filter(str => str != "");
			});
			// Send the list of anime releases for the season to the front-end.
			event.sender.send("fetchResult", [seasonContent.map(elem => [elem.title, elem.picture, elem.link, elem.score, elem.genres]), true, "Anime"]);
		}).catch(err => log.error("There was an issue in obtaining the releases for the anime season " + seasonInfo[0] + " " + seasonInfo[1].charAt(0).toUpperCase() + seasonInfo[1].slice(1) + "."));
	});

	// Handles the fetching of anime releases based on a query search.
	ipc.on("animeFetchSearch", (event, submission) => {
		// Fetch the search results.
		log.info("Searching for anime records based on the query " + submission[0] + ".");
		malScraper.search.search("anime", { "term": submission[0], "has": (submission[1] - 1) * 50 }).then(results => {
			const resultsArr = [];
			// Define a promise which will resolve only once a picture has been attained for each search result.
			const picPromise = new Promise((resolve, reject) => {
				// Iterate through the search results.
				results.forEach(elem => {
					// Fetch the anime details based on the URL.
					malScraper.getInfoFromURL(elem.url).then(elemData => {
						elemData.genres = elemData.genres.map(str => {
							if(str == "Coming-of-Age") {
		                    str = "ComingOfAge";
		                }
		                else if(str == "Post-Apocalyptic") {
		                    str = "PostApocalyptic";
		                }
		                else if(str == "Sci-Fi") {
		                    str = "SciFi";
		                }
		                else if(str == "Slice of Life") {
		                    str = "SliceOfLife";
		                }
		                return str;
						});
						// Push the anime details into the overall collection.
						resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, elemData.genres]);
						if(resultsArr.length == results.length) { resolve(); }
					}).catch(err => {
						log.error("There was an issue getting the anime details based on the url " + elem.url + ".");
						resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, []]);
						if(resultsArr.length == results.length) { resolve(); }
					});
				})
			});
			// Once all anime results have an associated picture send the list of anime releases to the front-end.
			picPromise.then(() => {
				event.sender.send("fetchResult", [resultsArr, false, "Anime", submission[1] == 1]);
			}).catch(err => log.error("There was an issue resolving the promise associated to grabbing anime release pictures based on the search query " + submission[0] + "."));
		}).catch(err => {
			log.warn("There was an issue obtaining the anime releases based on the query " + submission[0] + ". Returning an empty collection.");
			event.sender.send("fetchResult", [[], false, "Anime", submission[1] == 1]);
		});
	});

	// Handles the fetching of an anime synopsis.
	ipc.on("animeSynopsisFetch", (event, link) => {
		// Fetch the anime details based on the URL.
		malScraper.getInfoFromURL(link).then(data => {
			// Provide the anime synopsis to the front-end.
			event.sender.send("animeSynopsisFetchResult", data.synopsis);
		}).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
	});

	// Handles the opening of the addRecord.html page to load an anime record based on a season or query search.
	ipc.on("animeRecordRequest", (event, link) => {
		let animeRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		animeRecordWindow.webContents.on("did-finish-load", () => {
  			animeRecordWindow.webContents.send("searchRecordStart", "Anime");
  			// Fetch anime details.
			malScraper.getInfoFromURL(link).then(animeData => {
				// Define the parameters which will be passed to the front-end based on the details received.
				let startDate = "",
					endDate = "";
				const directorsArr = [],
					producersArr = [],
					writersArr = [],
					musicArr = [];
				// Properly define the start and end date of an anime listing on myanimelist.
				if(animeData.aired != undefined) {
					let splitArr = animeData.aired.split("to");
					startDate = splitArr[0];
					if(splitArr.length > 1) {
						endDate = splitArr[1];
					}
				}
				// Properly define the lists of directors, producers, writers, and music directors associated to the anime listing on myanimelist.
				animeData.staff.forEach(person => {
					person.role.split(", ").forEach(personRole => {
						if(personRole.toLowerCase().includes("director") && !personRole.toLowerCase().includes("sound")) {
							directorsArr.push(person.name.split(", ").reverse().join(" "));
						}
						if(personRole.toLowerCase().includes("producer")) {
							producersArr.push(person.name.split(", ").reverse().join(" "));
						}
						if(personRole.toLowerCase().includes("storyboard")) {
							writersArr.push(person.name.split(", ").reverse().join(" "));
						}
						if(personRole.toLowerCase().includes("sound") || person.role.toLowerCase().includes("music")) {
							musicArr.push(person.name.split(", ").reverse().join(" "));
						}
					});
				});
				animeRecordWindow.webContents.send("animeFetchDetailsResultName", animeData.title);
				// Fetch all possible images associated to the anime record.
				malScraper.getPictures({ "name": animeData.title, "id": animeData.id }).then(malImgArr => {
					// Send the attained data to the front-end.
					log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + animeData.title + ".");
					let allImgArr = malImgArr.map(pic => pic.imageLink);
					tools.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0);
					animeRecordWindow.webContents.send("animeFetchDetailsResult", [
						animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, allImgArr], startDate, endDate,
						animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
						animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
					]);
		  			ipc.once("performSave", (event, submission) => {
		  				// Save the corresponding data.
	  					exports.animeSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
		  			});
				}).catch(err => log.error("There was an issue getting the pictures associated to the anime " + animeData.title + "."));
			}).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
  		});
	});

	// Handles the fetching of books based on a query search.
	ipc.on("bookFetchSearch", (event, submission) => {
		// Fetch the search results.
		log.info("Searching for book records based on the query " + submission[0] + ".");
		GoodReadsScraper.searchBooks({ "q": submission[0], "page": submission[1] }).then(results => {
			const resultsArr = [];
			// Define a promise which will resolve only once a picture has been attained for each search result.
			const itemPromise = new Promise((resolve, reject) => {
				// Iterate through the search results.
				results.books.forEach(elem => {
					// Fetch the anime details based on the URL.
					GoodReadsScraper.getBook({ "url": "https://www.goodreads.com/en/book/show/" + elem.id }).then(elemData => {
						elemData.genres = elemData.genres.map(str => str == "Sci-Fi" ? "SciFi" : str);
						// Push the book details into the overall collection.
						resultsArr.push([elemData.title, elemData.coverLarge, elemData.url, (elemData.rating * 2).toFixed(2), elemData.genres]);
						if(resultsArr.length == results.books.length) { resolve(); }
					}).catch(err => {
						log.error("There was an issue getting the book details based on the url " + elem.url + ".");
						resultsArr.push([elem.title, elem.coverLarge, elem.url, (elem.rating * 2).toFixed(2), []]);
						if(resultsArr.length == results.books.length) { resolve(); }
					});
				});
			});
			// Once all book results have the necessary details send the list of books to the front-end.
			itemPromise.then(() => {
				event.sender.send("fetchResult", [resultsArr, false, "Book", submission[1] == 1]);
			}).catch(err => log.error("There was an issue resolving the promise associated to grabbing book details based on the search query " + submission[0] + "."));
		}).catch(err => {
			log.warn("There was an issue obtaining the books based on the query " + submission[0] + ". Returning an empty collection.");
			event.sender.send("fetchResult", [[], false, "Book", submission[1] == 1]);
		});
	});

	// Handles the fetching of a book synopsis.
	ipc.on("bookSynopsisFetch", (event, link) => {
		// Fetch the book details based on the URL.
		GoodReadsScraper.getBook({ "url": link }).then(data => {
			// Provide the book synopsis to the front-end.
			event.sender.send("bookSynopsisFetchResult", data.description);
		}).catch(err => log.error("There was an issue getting the book details based on the url " + link + "."));
	});

	// Handles the opening of the addRecord.html page to load a book record based on a query search.
	ipc.on("bookRecordRequest", (event, link) => {
		let bookRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		bookRecordWindow.webContents.on("did-finish-load", () => {
  			bookRecordWindow.webContents.send("searchRecordStart", "Book");
  			// Fetch book details.
			GoodReadsScraper.getBook({ "url": link }).then(bookData => {
				// Send the attained data to the front-end.
				log.info("GoodReads-Scraper has finished getting the details associated to the book " + bookData.title + ".");
				bookRecordWindow.webContents.send("bookFetchDetailsResult", [
					bookData.title, bookData.originalTitle, bookData.coverLarge,
					(bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
					bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres
				]);
	  			ipc.once("performSave", (event, submission) => {
	  				// Save the corresponding data.
  					exports.bookSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
	  			});
			}).catch(err => log.error("There was an issue getting the book details based on the url " + link + "."));
  		});
	});

	// Handles the request for getting the logs since the last application load.
	ipc.on("logsRequest", event => {
		// Read the logs file.
        fs.readFile(path.join(originalPath, "Trak", "logs", "main.log"), "UTF8", (err, file) => {
        	if(err) {
        		log.error("There was an issue reading the logs file.");
        		event.sender.send("logsFileReadFailure");
        	}
            else {
            	log.info("The logs file was successfully read.");
            	// Split the file contents by lines.
	            let fileData = file.split("\n");
	            // Remove the last element which is an empty string.
	            fileData.pop();
	            // Iterate through the lines to determine the last application load.
	            let ind = fileData.length - 1;
	            for(; ind >= 0; ind--) {
	                if(fileData[ind].includes("The application is starting.")) { break; }
	            }
	            // Send the logs to the front-end.
	            event.sender.send("logsRequestResult", fileData.slice(ind));
            }
        });
	});

	// Handles the opening of the logs file.
  	ipc.on("logsFile", event => {
  		exec(tools.startCommandLineFolder() + " " + path.join(originalPath, "Trak", "logs", "main.log"));
  		log.info("The logs file has been opened.");
		event.sender.send("logsFileSuccess");
  	});

  	// Checks the validity of a user given path.
  	ipc.on("checkPathValidity", (event, pathStr) => {
  		log.info("Checking the validity of the path " + pathStr + ".");
  		require('is-valid-path')(pathStr) == true ? event.sender.send("checkPathResult", true) : event.sender.send("checkPathResult", false);
  	});
};



module.exports = exports;