/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - writeDataFile: Handles the writing of files associated to a record.
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

Handles the saving of anime record by creating the associated folders and data file.

	- primaryWin is an object representing the app's primary window.
	- BrowserWindow provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.
	- data is the information associated to the record.

*/
exports.animeSave = (primaryWin, BrowserWindow, path, fs, mainWindow, dataPath, evnt, data) => {
	// Check to see that the folder associated to the new record does not exist.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[1])) && !fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[2]))) {
		// Create a new directory for the assets associated to the new record.
		fs.mkdirSync(path.join(dataPath, "Trak", "data", data[0] + "-" + (data[1] != "" ? data[1] : data[2]), "assets"), { "recursive": true });
	}
	const animeObj = {
		"category": data[0],
		"name": data[1],
		"jname": data[2],
		"review": data[3],
		"directors": data[4],
		"producers": data[5],
		"writers": data[6],
		"musicians": data[7],
		"studio": data[8],
		"license": data[9],
		"genres": data[11],
		"content": []
	};
	for(let m = 0; m < data[12].length; m++) {
		if(data[12][m][0] == "Single") {
			animeObj.content.push({
				"scenario": data[12][m][0],
				"name": data[12][m][1],
				"type": data[12][m][2],
				"release": data[12][m][3],
				"watched": data[12][m][4],
				"rating": data[12][m][5],
				"review": data[12][m][6]
			});
		}
		else if(data[12][m][0] == "Season") {
			let animeSeasonObj = {
				"scenario": data[12][m][0],
				"name": data[12][m][1],
				"start": data[12][m][2],
				"end": data[12][m][3],
				"status": data[12][m][4],
				"episodes": []
			};
			for(let n = 0; n < data[12][m][5].length; n++) {
				animeSeasonObj.episodes.push({
					"name": data[12][m][5][n][0],
					"watched": data[12][m][5][n][1],
					"rating": data[12][m][5][n][2],
					"review": data[12][m][5][n][3]
				});
			}
			animeObj.content.push(animeSeasonObj);
		}
	}
	exports.writeDataFile(primaryWin, BrowserWindow.getFocusedWindow(), animeObj, "A", dataPath, fs, path, evnt, data);
};



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

  	// Handles the load of the addRecord.html page.
  	ipc.on("addLoad", event => {
  		let win = BrowserWindow.getFocusedWindow(),
  			addWindow = tools.createWindow("addRecord", BrowserWindow, path, 1400, 1000);
  		addWindow.webContents.on("did-finish-load", () => {
  			ipc.on("performSave", (event, submission) => {
				// If the record is an anime then save the corresponding data.
				if(submission[0] == "Anime") {
	  				exports.animeSave(win, BrowserWindow, path, fs, mainWindow, dataPath, event, submission);
				}
  			});
  		});
  	});

  	// // Handles the update of a contact.
  	// ipc.on("contactUpdate", (event, name) => {
  	// 	let contactUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  	// 	contactUpdateWindow.webContents.on("did-finish-load", () => {
  	// 		contactUpdateWindow.webContents.send("contactUpdateInfo", name);
  	// 		ipc.once("updateContactSubmission", (event, data) => {
  	// 			require("./modifyContact").updateContact(data, event, contactUpdateWindow, dataPath, fs, path);
  	// 			mainWindow.reload();
  	// 		});
  	// 	});
  	// });

  	// Handles the deletion of multiple contacts.
  	ipc.on("removeRecords", (event, list) => {
  		// require("./modifyContact").removeContacts(list, event, mainWindow, BrowserWindow, ipc, dataPath, tools, fs, path);
  		exports.removeRecords(BrowserWindow.getFocusedWindow(), BrowserWindow, ipc, dataPath, tools, fs, path, list);




  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, folder) => {
		exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", folder, "assets"));
		event.sender.send("recordFilesSuccess", folder);
	});
};













// /*

// Handles the update of a contact.

// 	- info is a contact name.
// 	- event provides the means to interact with the front-end of the Electron app.
// 	- currentWindow is an object representing the current window of the Electron app.
// 	- userPath is the path to the local user data.
// 	- fs and path provide the means to work with local files.

// */
// exports.updateContact = (info, event, currentWindow, userPath, fs, path) => {
// 	// Define an object containing the updated contact data.
// 	let phoneArr = [];
// 	for(let j = 0; j < info[7].length; j++) {
// 		phoneArr.push({"label": info[6][j], "number": info[7][j]});
// 	}
// 	const contactData = {
// 		"firstName": info[0],
// 		"middleName": info[1],
// 		"lastName": info[2],
// 		"birthday": info[3],
// 		"notes": info[4],
// 		"phones": phoneArr
// 	};
// 	// If the name has been updated then change the associated contact folder name.
// 	if(info[2] + "_" + info[0] != info[8]) {
// 		fs.rename(path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[8]), path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0]), err => {
// 			// If there was an error in renaming the contact folder notify the user.
// 			if(err) {
// 				event.sender.send("contactFolderRenameFailure", [info[8], info[2] + "_" + info[0]]);
// 			}
// 			// If no error occured in renaming the contact folder write the data file, and copy over the file assets.
// 			else {
// 				exports.writeDataFile(info, event, currentWindow, contactData, "U", userPath, fs, path);
// 			}
// 		});
// 	}
// 	else {
// 		// Write the data file, and copy over the file assets.
// 		exports.writeDataFile(info, event, currentWindow, contactData, "U", userPath, fs, path);
// 	}
// };















module.exports = exports;