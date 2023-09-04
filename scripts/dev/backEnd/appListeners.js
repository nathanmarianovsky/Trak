/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - writeDataFile: Handles the writing of files associated to a record.
   - animeObjCreation: Creates an object associated to an anime record in order to save/update.
   - animeSave: Handles the saving of anime record by creating the associated folders and data file.
   - animeUpdate: Handles the update of an anime record.
   - removeRecords: Handles the removal of records by deleting the associated folders and data file.
   - updateSettings: Handles the update of all settings files.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles the writing of files associated to a record.

	- globalWin is an object representing the app's primary window.
	- curWin is an object representing the current window of the Electron app.
	- writeData is an object representing the data that is to be written to the data.json file.
	- mode is a string representing whether a record is being added or updated.
	- savePath is the path to the local user data.
	- fs and path provide the means to work with local files.
	- evt provides the means to interact with the front-end of the Electron app.
	- info is the data associated to the record.

*/
exports.writeDataFile = (globalWin, curWin, writeData, mode, savePath, fs, path, evt, info) => {
	let fldr = "";
	const modeStr = (mode == "A" ? "add" : "update");
	if(info[0] == "Anime") { fldr = info[0] + "-" + (info[1] != "" ? info[1] : info[2]); }	
	fs.writeFile(path.join(savePath, "Trak", "data", fldr, "data.json"), JSON.stringify(writeData), "UTF8", err => {
		// If there was an error in writing to the data file, then notify the user.
		if(err) { evt.sender.send(modeStr + "RecordFailure", fldr); }
		else {
			// Copy over the files asked to be added as assets in association to a particular contact.
			let i = 0;
			for(; i < info[10].length; i++) {
				let dest = path.join(savePath, "Trak", "data", fldr, "assets", path.basename(info[10][i]));
				fs.copyFile(info[10][i], dest, err => {
					if(err) { evt.sender.send("copyFailure", info[10][i]); }
				});
			}
			// Once all of the files have been updated, notify the user everything has been taken care of and close the window.
			if(i == info[10].length) {
				globalWin.reload();
				curWin.webContents.send(modeStr + "RecordSuccess", fldr);
				setTimeout(() => { curWin.destroy(); }, 2000);
			}
		}
	});
};



/*

Creates an object associated to an anime record in order to save/update.

	- providedData is the data provided by the front-end user submission for anime record save/update.

*/
var animeObjCreation = providedData => {
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

Handles the saving of anime record by creating the associated folders and data file.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.animeSave = (BrowserWindow, path, fs, mainWindow, dataPath, evnt, data) => {
	// Check to see that the folder associated to the new record does not exist.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[1])) && !fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[2]))) {
		// Create a new directory for the assets associated to the new record.
		fs.mkdirSync(path.join(dataPath, "Trak", "data", data[0] + "-" + (data[1] != "" ? data[1] : data[2]), "assets"), { "recursive": true });
		exports.writeDataFile(mainWindow, BrowserWindow.getFocusedWindow(), animeObjCreation(data), "A", dataPath, fs, path, evnt, data);
	}
	else {
		evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[2]));
	}
};



/*

Handles the update of an anime record.

	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.
	- data is the information associated to the record.

*/
exports.animeUpdate = (BrowserWindow, path, fs, mainWindow, dataPath, evnt, data) => {
	// If the name has been updated then change the associated record folder name.
	if((data[1] != "" && data[1] != data[13]) || (data[1] == "" && data[2] != "" && data[2] != data[13]) ) {
		fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + data[13]), path.join(dataPath, "Trak", "data", data[0] + "-" + (data[1] != "" ? data[1] : data[2])), err => {
			// If there was an error in renaming the record folder notify the user.
			if(err) {
				evnt.sender.send("recordFolderRenameFailure", [data[13], data[1] != "" ? data[1] : data[2]]);
			}
			// If no error occured in renaming the record folder write the data file, and copy over the file assets.
			else {
				exports.writeDataFile(mainWindow, BrowserWindow.getFocusedWindow(), animeObjCreation(data), "U", dataPath, fs, path, evnt, data);
			}
		});
	}
	else {
		// Write the data file, and copy over the file assets.
		exports.writeDataFile(mainWindow, BrowserWindow.getFocusedWindow(), animeObjCreation(data), "U", dataPath, fs, path, evnt, data);
	}
};



/*

Handles the removal of records by deleting the associated folders and data file.

	- primaryWin is an object representing the current window of the Electron app.
	- userPath is the path to the local user data.
	- fs and path provide the means to work with local files.
	- data is a collection of record names.

*/
exports.removeRecords = (primaryWin, userPath, fs, path, data) => {
	// Once a confirmation has been provided by the user delete the associated record folders. 
	let j = 0;
	for(; j < data.length; j++) {
		fs.rm(path.join(userPath, "Trak", "data", data[j]), { "force": true, "recursive": true }, err => {
			// If there was an error in deleting the record folder notify the user.
			if(err) { primaryWin.webContents.send("recordRemovalFailure", data[j]); }
		});
	}
	// Refresh the primary window and notify the user that all checked contacts have been removed.
	if(j == data.length) {
		primaryWin.reload();
		setTimeout(() => { primaryWin.webContents.send("recordsRemovalSuccess"); }, 500);
	}
};



/*

Handles the update of all settings files.

	- path and fs provide the means to work with local files.
	- app and ipc provide the means to operate the Electron app.
	- dataArr is the array submitted from the front-end to update the settings options.
	- appDirectory is the path to the local user data.
	- evnt provides the means to interact with the front-end of the Electron app.

*/
exports.updateSettings = (fs, path, ipc, app, dataArr, appDirectory, evnt) => {
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
		if(er) { evnt.sender.send("introductionFileReadFailure"); }
		else {
			// Define the tutorial boolean.
			const origIntro = JSON.parse(tutorialFile).introduction;
			// Write the tutorial.json file with the submitted data.
			fs.writeFile(path.join(appDirectory, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": dataArr[9] }), "UTF8", error => {
				// If there was an issue writing the tutorial.json file notify the user.
				if(error) { evnt.sender.send("introductionFileSaveFailure"); }
				else {
					// If the tutorial data was changed notify the user that the file was successfully updated.
					if(origIntro != dataArr[9]) { evnt.sender.send("introductionFileSaveSuccess"); }
					// Read the settings configuration.json file.
					fs.readFile(path.join(appDirectory, "Trak", "config", "configuration.json"), (err, file) => {
						// If there was an issue in reading the configuration.json file notify the user.
				        if(err) { evnt.sender.send("configurationFileOpeningFailure"); }
				        else {
				        	// Define the settings configuration data.
				        	const configurationData = JSON.parse(file);
				        	// Delete the user records located in the previous location if requested.
				        	ipc.on("dataOriginalDelete", (eve, resp) => {
				        		// Only delete the previous user records if the user wants to.
					  			if(resp[0] == true) {
					  				// Remove the directory and all content in it.
					  				fs.rm(configurationData.current.path, { "forced": true, "recursive": true}, er => {
					  					// If there was an issue in removing the directory notify the user.
					  					if(er) { eve.sender.send("dataDeleteFailure"); }
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
												if(err) { eve.sender.send("configurationFileWritingFailure"); }
												else {
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
										if(err) { eve.sender.send("configurationFileWritingFailure"); }
										else {
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
									fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
										if(err) { evnt.sender.send("configurationFileWritingFailure"); }
										else {
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
										fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
											if(err) { evnt.sender.send("configurationFileWritingFailure"); }
											else {
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
										  	if(err) { event.sender.send("dataCopyFailure"); }
										  	else { event.sender.send("dataOriginalDeleteAsk", false); }
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
									fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
										if(err) { evnt.sender.send("configurationFileWritingFailure"); }
										else {
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
										fs.writeFile(path.join(appDirectory, "Trak", "config", "configuration.json"), JSON.stringify(configurationData), "UTF8", err => {
											if(err) { evnt.sender.send("configurationFileWritingFailure"); }
											else {
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
										  	if(err) { evnt.sender.send("dataCopyFailure"); }
										  	else { evnt.sender.send("dataOriginalDeleteAsk", true); }
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
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec and shell provide the means to open files, folders, and links.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, BrowserWindow, path, fs, exec, shell, ipc, tools, mainWindow, dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
	   		let win = tools.createWindow("index", originalPath, BrowserWindow, path, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	   		win.webContents.on("did-finish-load", () => {
	  			win.webContents.send("loadRows", primaryWindowFullscreen == true ? primaryWindow.getContentSize()[1] - 800 : primWinHeight - 800);
	  			tools.tutorialLoad(fs, path, primaryWindow, basePath);
	  		});
    	}
  	});

  	// Close the Electron app if the primary window is closed.
  	mainWindow.on("close", () => {
    	mainWindow = null;
       	app.quit();
    });

  	// Handle the load of the home page.
  	ipc.on("home", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "index.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
  			mainWindow.webContents.send("loadRows", primaryWindowFullscreen == true ? primaryWindow.getContentSize()[1] - 800 : primWinHeight - 800);
  		});
  	});

    ipc.on("introductionFileSave", (event, launchIntro) => {
    	if(!fs.existsSync(path.join(originalPath, "Trak", "config", "tutorial.json"))) {
	    	fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) { event.sender.send("introductionFileSaveFailure"); }
	    		else {
	    			// event.sender.send("introductionFileSaveSuccess");
	    		}
	    	});
    	}
    	else if(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction != launchIntro) {
    		fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) { event.sender.send("introductionFileSaveFailure"); }
	    		else {
	    			event.sender.send("introductionFileSaveSuccess");
	    		}
	    	});
    	}
    });

  	// Handle the opening of the github link on the about section.
  	ipc.on("aboutGithub", event => {
  		shell.openExternal("https://github.com/nathanmarianovsky/Trak");
  	});

	// If the data folder does not exist, then create it.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data"))) {
		fs.mkdirSync(path.join(dataPath, "Trak", "data"), { "recursive": true });
	}

  	// Handles the load of the addRecord.html page for the creation of a record.
  	ipc.on("addLoad", (event, scenario) => {
  		let addWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		addWindow.webContents.on("did-finish-load", () => {
  			if(scenario == true) {
  				addWindow.webContents.send("addIntroduction");
  			}
  			ipc.once("performSave", (event, submission) => {
				// If the record is an anime then save the corresponding data.
				if(submission[0] == "Anime") {
	  				exports.animeSave(BrowserWindow, path, fs, mainWindow, dataPath, event, submission);
				}
  			});
  		});
  	});

  	// Handles the load of the addRecord.html page for the update of a record.
  	ipc.on("updateRecord", (event, fldrName) => {
  		let recordUpdateWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		recordUpdateWindow.webContents.on("did-finish-load", () => {
  			recordUpdateWindow.webContents.send("recordUpdateInfo", fldrName);
  			ipc.once("performSave", (event, submission) => {
  				exports.animeUpdate(BrowserWindow, path, fs, mainWindow, dataPath, event, submission);
  			});
  		});
  	});

  	// Handles the deletion of multiple contacts.
  	ipc.on("removeRecords", (event, list) => {
  		exports.removeRecords(BrowserWindow.getFocusedWindow(), dataPath, fs, path, list);
  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, folder) => {
		exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", folder, "assets"));
		event.sender.send("recordFilesSuccess", folder);
	});

	// Handles the saving of all options in the user settings.
	ipc.on("settingsSave", (event, submissionArr) => {
		exports.updateSettings(fs, path, ipc, app, submissionArr, originalPath, event);
	});

	// tools.exportData(fs, path, zipper, basePath, "D:\\Downloads\\Temp.zip");
};



module.exports = exports;