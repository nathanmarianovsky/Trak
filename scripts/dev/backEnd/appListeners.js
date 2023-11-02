/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - updateSettings: Handles the update of all settings files.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



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
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- exec and shell provide the means to open files, folders, and links.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, BrowserWindow, path, fs, log, os, spawn, https, exec, shell, ipc, tools, updateCondition, mainWindow, dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
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
	  				require("./animeTools").animeSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
				}
				else if(submission[0] == "Book") {
					require("./bookTools").bookSave(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
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
  					require("./animeTools").animeUpdate(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
  				}
  				else if(submission[0] == "Book") {
  					require("./bookTools").bookUpdate(BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, event, submission);
  				}
  			});
  		});
  	});

  	// Handles the deletion of multiple records.
  	ipc.on("removeRecords", (event, list) => {
  		tools.removeRecords(log, BrowserWindow.getFocusedWindow(), dataPath, fs, path, list);
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
	ipc.on("animeSearch", (event, submission) => {
		require("./animeTools").animeSearch(log, require("mal-scraper"), event, submission);
	});

	// Handles the search of a string through all possible book listings on goodreads.
	ipc.on("bookSearch", (event, submission) => {
		require("./bookTools").bookSearch(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given anime via its name.
	ipc.on("animeFetchDetails", (event, submission) => {
		require("./animeTools").animeFetchDetails(log, require("mal-scraper"), tools, event, submission);
	});

	// Handles the fetching of details for a given book via its name.
	ipc.on("bookFetchDetailsByName", (event, submission) => {
		require("./bookTools").bookFetchDetailsByName(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its ISBN.
	ipc.on("bookFetchDetailsByISBN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByISBN(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its ASIN.
	ipc.on("bookFetchDetailsByASIN", (event, asin) => {
		require("./bookTools").bookFetchDetailsByName(log, require("goodreads-scraper"), event, submission, 0);
	});


	// Handles the fetching of the primary window's current height in order to provide the necessary difference for the index page table height to be updated.
	ipc.on("getAppHeight", event => {
		event.sender.send("appHeight", mainWindow.getBounds().height - 800);
	});

	// Handles the fetching of anime releases based on the season.
	ipc.on("animeFetchSeason", (event, submissionArr) => {
		require("./bookTools").animeFetchSeason(log, require("mal-scraper"), event, submissionArr);
	});

	// Handles the fetching of anime releases based on a query search.
	ipc.on("animeFetchSearch", (event, submission) => {
		require("./animeTools").animeFetchSearch(log, require("mal-scraper"), event, submission);
	});

	// Handles the fetching of an anime synopsis.
	ipc.on("animeSynopsisFetch", (event, submission) => {
		require("./animeTools").animeSynopsisFetch(log, require("mal-scraper"), event, submission);
	});

	// Handles the opening of the addRecord.html page to load an anime record based on a season or query search.
	ipc.on("animeRecordRequest", (event, submission) => {
		let animeRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		animeRecordWindow.webContents.on("did-finish-load", () => {
  			animeRecordWindow.webContents.send("searchRecordStart", "Anime");
  			require("./animeTools").animeRecordRequest(BrowserWindow, ipc, path, fs, log, https, require("mal-scraper"), tools, mainWindow, animeRecordWindow, dataPath, submission);
  		});
	});

	// Handles the fetching of books based on a query search.
	ipc.on("bookFetchSearch", (event, submission) => {
		require("./bookTools").bookFetchSearch(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of a book synopsis.
	ipc.on("bookSynopsisFetch", (event, submission) => {
		require("./bookTools").bookSynopsisFetch(log, GoodReadsScraper, event, submission);
	});

	// Handles the opening of the addRecord.html page to load a book record based on a query search.
	ipc.on("bookRecordRequest", (event, submission) => {
		let bookRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		bookRecordWindow.webContents.on("did-finish-load", () => {
  			bookRecordWindow.webContents.send("searchRecordStart", "Book");
  			require("./bookTools").bookRecordRequest(BrowserWindow, ipc, path, fs, log, https, require("goodreads-scraper"), tools, mainWindow, bookRecordWindow, dataPath, submission);
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