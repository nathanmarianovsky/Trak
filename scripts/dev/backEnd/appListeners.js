/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - addBasicListeners: Driver function for adding all basic listeners.
   - addRecordListeners: Driver function for adding all listeners associated to the maintenance of records.
   - addAnimeListeners: Driver function for adding all anime listeners.
   - addBookListeners: Driver function for adding all book listeners.
   - addFilmListeners: Driver function for adding all film listeners.
   - addMangaListeners: Driver function for adding all manga listeners.
   - addDatabaseListeners: Driver function for adding all database listeners.
   - addSettingsListeners: Driver function for adding all settings listeners.
   - addUpdateListeners: Driver function for adding all update listeners.
   - addLogListeners: Driver function for adding all log listeners.
   - addHelperListeners: Driver function for adding all helper listeners.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Driver function for adding all basic listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, and primaryWindowFullscreen are the window parameters.

*/
exports.addBasicListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
   		let win = tools.createWindow("index", originalPath, BrowserWindow, path, log, dev, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
   		win.webContents.on("did-finish-load", () => {
  				win.webContents.send("loadRows", win.getContentSize()[1] - 800);
  				tools.tutorialLoad(fs, path, log, win, originalPath);
  				if(updateCondition == false) {
  					tools.checkForUpdate(require("os"), require("https"), fs, path, log, originalPath, win);
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
};



/*

Driver function for adding all listeners associated to the maintenance of records.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addRecordListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the load of the addRecord.html page for the creation of a record.
  	ipc.on("addLoad", (event, scenario) => {
  		let addWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		addWindow.webContents.on("did-finish-load", () => {
  			if(scenario == true) {
  				log.info("Loading the application tutorial for the addRecord.html page.");
  				addWindow.webContents.send("addIntroduction");
  			}
  			addWindow.webContents.send("addRecordInitialMessage");
  			ipc.once("performSave", (event, submission) => {
				// If the record is an anime then save the corresponding data.
				if(submission[0] == "Anime") {
	  				require("./animeTools").animeSave(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
				}
				else if(submission[0] == "Book") {
					require("./bookTools").bookSave(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
				}
				else if(submission[0] == "Film") {
					require("./filmTools").filmSave(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
				}
				else if(submission[0] == "Manga") {
	  				require("./mangaTools").mangaSave(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
				}
  			});
  		});
  	});

  	// Handles the load of the addRecord.html page for the update of a record.
  	ipc.on("updateRecord", (event, fldrName) => {
  		let recordUpdateWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		recordUpdateWindow.webContents.on("did-finish-load", () => {
  			recordUpdateWindow.webContents.send("recordUpdateInfo", fldrName);
  			ipc.once("performSave", (event, submission) => {
				if(submission[0] == "Anime") {
  					require("./animeTools").animeUpdate(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
  				}
  				else if(submission[0] == "Book") {
  					require("./bookTools").bookUpdate(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
  				}
  				else if(submission[0] == "Film") {
					require("./filmTools").filmUpdate(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
				}
  				else if(submission[0] == "Manga") {
  					require("./mangaTools").mangaUpdate(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
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
		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", params[0], "assets"));
		log.info("The application successfully opened the folder directory " + path.join(dataPath, "Trak", "data", params[0], "assets") + ".");
		event.sender.send("recordFilesSuccess", params[1]);
	});
};



/*

Driver function for adding all anime listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addAnimeListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the search of a string through all possible anime listings on myanimelist.
	ipc.on("animeSearch", (event, submission) => {
		require("./animeTools").animeSearch(log, require("mal-scraper"), event, submission);
	});

	// Handles the fetching of details for a given anime via its name.
	ipc.on("animeFetchDetails", (event, submission) => {
		require("./animeTools").animeFetchDetails(log, require("mal-scraper"), tools, event, submission);
	});

	// Handles the fetching of anime releases based on the season.
	ipc.on("animeFetchSeason", (event, submissionArr) => {
		require("./animeTools").animeFetchSeason(log, require("mal-scraper"), event, submissionArr);
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
		let animeRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		animeRecordWindow.webContents.on("did-finish-load", () => {
  			animeRecordWindow.webContents.send("searchRecordStart", "Anime");
  			require("./animeTools").animeRecordRequest(BrowserWindow, ipc, path, fs, log, require("https"), require("mal-scraper"), tools, mainWindow, animeRecordWindow, dataPath, submission);
  		});
	});
};



/*

Driver function for adding all book listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addBookListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the search of a string through all possible book listings on goodreads.
	ipc.on("bookSearch", (event, submission) => {
		require("./bookTools").bookSearch(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its name.
	ipc.on("bookFetchDetails", (event, submission) => {
		require("./bookTools").bookFetchDetailsByName(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its ISBN.
	ipc.on("bookFetchDetailsByISBN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByISBN(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its ASIN.
	ipc.on("bookFetchDetailsByASIN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByName(log, require("goodreads-scraper"), event, submission, 0);
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
		let bookRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		bookRecordWindow.webContents.on("did-finish-load", () => {
  			bookRecordWindow.webContents.send("searchRecordStart", "Book");
  			require("./bookTools").bookRecordRequest(BrowserWindow, ipc, path, fs, log, require("https"), require("goodreads-scraper"), tools, mainWindow, bookRecordWindow, dataPath, submission);
  		});
	});
};



/*

Driver function for adding all film listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addFilmListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the search of a string through all possible film listings on imdb.
	ipc.on("filmSearch", (event, submission) => {
		require("./filmTools").filmSearch(log, require("imdb-scrapper"), event, submission);
	});

	// Handles the fetching of details for a given film via its name.
	ipc.on("filmFetchDetails", (event, submission) => {
		require("./filmTools").filmFetchDetails(log, require("movier"), tools, event, submission);
	});

	// Handles the fetching of anime releases based on a query search.
	ipc.on("filmFetchSearch", (event, submission) => {
		require("./filmTools").filmFetchSearch(log, require("movier"), event, submission, path);
	});

	// Handles the fetching of a film synopsis.
	ipc.on("filmSynopsisFetch", (event, submission) => {
		require("./filmTools").filmSynopsisFetch(log, require("movier"), event, submission);
	});

	// Handles the opening of the addRecord.html page to load a film record based on a query search.
	ipc.on("filmRecordRequest", (event, submission) => {
		let filmRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		filmRecordWindow.webContents.on("did-finish-load", () => {
  			filmRecordWindow.webContents.send("searchRecordStart", "Film");
  			require("./filmTools").filmRecordRequest(BrowserWindow, ipc, path, fs, log, require("https"), require("movier"), tools, mainWindow, filmRecordWindow, dataPath, submission);
  		});
	});
};



/*

Driver function for adding all manga listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addMangaListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the search of a string through all possible manga listings on myanimelist.
	ipc.on("mangaSearch", (event, submission) => {
		require("./mangaTools").mangaSearch(log, require("mal-scraper"), event, submission);
	});

	// Handles the fetching of details for a given manga via its name.
	ipc.on("mangaFetchDetails", (event, submission) => {
		require("./mangaTools").mangaFetchDetails(log, require("mal-scraper"), require("goodreads-scraper"), tools, event, submission);
	});

	// Handles the fetching of details for a given manga volume via its ISBN.
	ipc.on("mangaVolumeFetchDetailsByISBN", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByISBN(log, require("goodreads-scraper"), event, submission[0], submission[1]);
	});

	// Handles the fetching of details for a given manga volume via its name.
	ipc.on("mangaVolumeFetchDetailsByName", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByName(log, require("goodreads-scraper"), event, submission[0], submission[1]);
	});

	// Handles the fetching of manga releases based on a query search.
	ipc.on("mangaFetchSearch", (event, submission) => {
		require("./mangaTools").mangaFetchSearch(log, require("mal-scraper"), event, submission);
	});

	// Handles the fetching of a manga synopsis.
	ipc.on("mangaSynopsisFetch", (event, submission) => {
		require("./mangaTools").mangaSynopsisFetch(log, require("mal-scraper"), event, submission);
	});

	// Handles the opening of the addRecord.html page to load a manga record based on a season or query search.
	ipc.on("mangaRecordRequest", (event, submission) => {
		let mangaRecordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
  		mangaRecordWindow.webContents.on("did-finish-load", () => {
  			mangaRecordWindow.webContents.send("searchRecordStart", "Manga");
  			require("./mangaTools").mangaRecordRequest(BrowserWindow, ipc, path, fs, log, require("https"), require("mal-scraper"), require("goodreads-scraper"), tools, mainWindow, mangaRecordWindow, dataPath, submission);
  		});
	});
};



/*

Driver function for adding all database listeners.

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- originalPath is the original path to the local user data.

*/
exports.addDatabaseListeners = (path, fs, log, ipc, tools, mainWindow, originalPath) => {
	// Handles the opening of the zip import sample directory.
  	ipc.on("importSampleZIP", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples"));
  		log.info("The directory containg the sample zip import has been opened.");
		event.sender.send("importSampleZIPSuccess");
  	});

  	// Handles the opening of the simple xlsx import sample directory.
  	ipc.on("importSampleSimpleXLSX", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Simple-XLSX-Export-Sample"));
  		log.info("The directory containg the sample simple xlsx import has been opened.");
		event.sender.send("importSampleSimpleXLSXSuccess");
  	});

  	// Handles the opening of the detailed xlsx import sample directory.
  	ipc.on("importSampleDetailedXLSX", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Detailed-XLSX-Export-Sample"));
  		log.info("The directory containg the sample detailed xlsx import has been opened.");
		event.sender.send("importSampleDetailedXLSXSuccess");
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
};



/*

Driver function for adding all settings listeners.

	- app and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- originalPath is the original path to the local user data.

*/
exports.addSettingsListeners = (app, path, fs, log, ipc, originalPath) => {
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

   	// Handles the saving of all options in the user settings.
	ipc.on("settingsSave", (event, submissionArr) => {
		require("./settings").updateSettings(fs, path, log, ipc, app, submissionArr, originalPath, event);
	});

	// Handle the opening of the github link on the about section.
  	ipc.on("aboutGithub", event => {
  		log.info("Opening the Github project page in the default browser.");
  		require("electron").shell.openExternal("https://github.com/nathanmarianovsky/Trak");
  	});
};



/*

Driver function for adding all update listeners.

	- app and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.

*/
exports.addUpdateListeners = (app, path, fs, log, ipc) => {
	// Handles the download of an updated installer and launching it.
	ipc.once("appUpdate", (event, appUpdateData) => {
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
				app.quit();
		    }, 5000);
		}).catch(err => log.error("There was an issue in downloading the latest Github release of the application."));
	});

	// Handle the opening of the github release link on the update modal.
  	ipc.on("githubRelease", (event, url) => {
  		log.info("Opening the update release page in the default browser.");
  		require("electron").shell.openExternal(url);
  	});
};



/*

Driver function for adding all log listeners.

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- tools provides a collection of local functions.
	- originalPath is the original path to the local user data.

*/
exports.addLogListeners = (path, fs, log, ipc, tools, originalPath) => {
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
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(originalPath, "Trak", "logs"));
  		log.info("The folder containing the log files has been opened.");
		event.sender.send("logsFileSuccess");
  	});
};



/*

Driver function for adding all helper listeners.

	- ipc provides the means to operate the Electron app.
	- log provides the means to create application logs to keep track of what is going on.
	- mainWindow is an object referencing the primary window of the Electron app.

*/
exports.addHelperListeners = (log, ipc, mainWindow) => {
	// Handles the fetching of the primary window's current height in order to provide the necessary difference for the index page table height to be updated.
	ipc.on("getAppHeight", event => {
		event.sender.send("appHeight", mainWindow.getBounds().height - 800);
	});

  	// Checks the validity of a user given path.
  	ipc.on("checkPathValidity", (event, pathStr) => {
  		log.info("Checking the validity of the path " + pathStr + ".");
  		require('is-valid-path')(pathStr) == true ? event.sender.send("checkPathResult", true) : event.sender.send("checkPathResult", false);
  	});
};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Add the basic listeners.
	exports.addBasicListeners(app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	// Add the listeners associated to all types of records.
	exports.addRecordListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to anime records.
	exports.addAnimeListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to book records.
	exports.addBookListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to film records.
	exports.addFilmListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to manga records.
	exports.addMangaListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to exporting and importing data.
	exports.addDatabaseListeners(path, fs, log, ipc, tools, mainWindow, originalPath);
	// Add the listeners associated to all settings actions.
	exports.addSettingsListeners(app, path, fs, log, ipc, originalPath);
	// Add the listeners associated to all update actions.
	exports.addUpdateListeners(app, path, fs, log, ipc);
	// Add the listeners associated to log actions.
	exports.addLogListeners(path, fs, log, ipc, tools, originalPath);
	// Add the listeners which act as tools for the front-end.
	exports.addHelperListeners(log, ipc, mainWindow);
};



module.exports = exports;