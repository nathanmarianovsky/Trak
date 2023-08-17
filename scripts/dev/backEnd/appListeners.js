/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - writeDataFile: Handles the writing of files associated to a record.
   - animeObjCreation: Creates an object associated to an anime record in order to save/update.
   - animeSave: Handles the saving of anime record by creating the associated folders and data file.
   - removeRecords: Handles the removal of records by deleting the associated folders and data file.
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
	- event provides the means to interact with the front-end of the Electron app.
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



// (globalWin, curWin, writeData, mode, savePath, fs, path, evt, info)





/*

Handles the removal of records by deleting the associated folders and data file.

	- primaryWin is an object representing the current window of the Electron app.
	- BrowserWindow provides the means to create new windows in the Electron app.
	- ipc provides the means to handle a reaction on the back-end of the Electron app.
	- userPath is the path to the local user data.
	- toolsCollection provides a collection of local functions meant to help with various aspects of the app.
	- fs and path provide the means to work with local files.
	- data is a collection of record names.

*/
exports.removeRecords = (primaryWin, BrowserWindow, ipc, userPath, toolsCollection, fs, path, data) => {
	// Create a new window to ask the user to confirm the deletion of a contact.
	let removeRecordsWindow = toolsCollection.createWindow("confirmation", BrowserWindow, path, 525, 325);
	// Once the new window has been loaded, supply the message to the front-end.
	removeRecordsWindow.webContents.on("did-finish-load", () => {
		removeRecordsWindow.webContents.send("recordsConfirmationText", data);
		// Once a confirmation has been provided by the user close the window and delete the associated record folders. 
		ipc.once("confirmationRemoveRecords", (event, data) => {
			removeRecordsWindow.destroy();
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
		});
	});
};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.

*/
exports.addListeners = (app, BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
	   		let win = tools.createWindow("index", BrowserWindow, path);
	   		win.webContents.on("did-finish-load", () => {
	  			win.webContents.send("loadRows");
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
  			mainWindow.webContents.send("loadRows");
  		});
  	});

	// If the data folder does not exist, then create it.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data"))) {
		fs.mkdirSync(path.join(dataPath, "Trak", "data"), { "recursive": true });
	}

  	// Handles the load of the addRecord.html page for the creation of a record.
  	ipc.on("addLoad", event => {
  		let addWindow = tools.createWindow("addRecord", BrowserWindow, path, 1400, 1000);
  		addWindow.webContents.on("did-finish-load", () => {
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
  		let recordUpdateWindow = tools.createWindow("addRecord", BrowserWindow, path, 1400, 1000);
  		recordUpdateWindow.webContents.on("did-finish-load", () => {
  			recordUpdateWindow.webContents.send("recordUpdateInfo", fldrName);
  			ipc.once("performSave", (event, submission) => {
  				exports.animeUpdate(BrowserWindow, path, fs, mainWindow, dataPath, event, submission);
  			});
  		});
  	});

  	// Handles the deletion of multiple contacts.
  	ipc.on("removeRecords", (event, list) => {
  		exports.removeRecords(BrowserWindow.getFocusedWindow(), BrowserWindow, ipc, dataPath, tools, fs, path, list);
  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, folder) => {
		exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", folder, "assets"));
		event.sender.send("recordFilesSuccess", folder);
	});
};



module.exports = exports;