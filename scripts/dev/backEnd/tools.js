/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - invertColor: Inverts a given color by flipping the rgb values.
   - compatibilityCheck: Checks the configuration setup to ensure that all proper parameters exist if upgrading from a previous version.
   - lightOrDark: Determines whether a given color represents a dark or light one.
   - parseRecord: Handles the parsing of a record folder name to display.
   - formatFolderName: Formats a string into a proper folder name by removing forbidden characters and whitespaces.
   - objCreationImgs: Downloads images associated to a record and returns an array to their location.
   - recordObjCreation: Creates an object associated to a record in order to save/update.
   - writeDataFile: Handles the writing of files associated to a record.
   - removeRecords: Handles the removal of records by deleting the associated folders and data file.
   - arrayMove: Moves an element in an array.
   - genreList: Provides the list of all genres/tags that can be selected on the addRecord.html page for a record.
   - calculateReleaseDate: Calculate the earliest release date of an anime record based on the related content information.
   - calculateAnimeGlobalRating: Calculate the average rating of an anime record based on the related content information.
   - calculateMangaGlobalRating: Calculate the average rating of a manga record based on the related content information.
   - calculateShowGlobalRating: Calculate the average rating of a show record based on the related content information.
   - formatMedia: Formats the media type of a book record.
   - formatISBNString: Formats a string into a proper ISBN by adding hyphens.
   - exportDataXLSX: Create a xlsx file containing the exported library records along with a zip of the associated assets.
   - exportDataZIP: Create a zip file containing the exported library records.
   - importCompare: Finishes the application import process by checking whether the new records already exist in the library.
   - importDataXLSX: Reads a xlsx file and adds its content to the library records.
   - importDriverXLSX: Iterates through the list of xlsx files to be imported by waiting for each one to finish prior to proceeding to the next one.
   - importDataZIP: Reads a zip file and adds its content to the library records.
   - importDriverZIP: Iterates through the list of zip files to be imported by waiting for each one to finish prior to proceeding to the next one.
   - createTrayMenu: Create the system tray icon and menu.
   - createWindow: Executes the creation of the primary window with all necessary parameters.
   - tutorialLoad: Tells the front-end to load the application tutorial.
   - isURL: Tests whether a given string represents a url.
   - parseURLFilename: Extracts the filename from a given string representing a url.
   - parseFolder: Formats a folder name into a readable form for logging purposes.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Inverts a given color by flipping the rgb values.

   - hex is a string representing a color via its hexadecimal identifier.

*/
exports.invertColor = hex => {
	// Define a function to appropriately pad a component.
	const padZero = (str, len) => {
	    len = len || 2;
	    const zeros = new Array(len).join('0');
	    return (zeros + str).slice(-len);
	};
    if(hex.indexOf('#') == 0) { hex = hex.slice(1); }
    // Convert 3-digit hex to 6-digits.
    if(hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    // Invert the color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // Pad each of the components with zeros when returning.
    return "#" + padZero(r) + padZero(g) + padZero(b);
};



/*

Checks the configuration setup to ensure that all proper parameters exist if upgrading from a previous version.

	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dir is the path to the local user data.

*/
exports.compatibilityCheck = (fs, path, log, dir) => {
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, curConfig) => {
		if(err) {
			log.error("There was an issue in reading the application configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
		}
		else {
			const typeArr = ["original"],
				curConfigObj = JSON.parse(curConfig);
			if(curConfigObj.current != undefined) {
				typeArr.push("current");
			}
			for(let t = 0; t < typeArr.length; t++) {
				if(!("path" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["path"] = path.join(dir, "Trak", "data");
				}
				else if(!("primaryColor" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["primaryColor"] = "#2A2A8E";
				}
				else if(!("secondaryColor" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["secondaryColor"] = "#D9D9DB";
				}
				else if(!("primaryWindowWidth" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["primaryWindowWidth"] = 1000;
				}
				else if(!("primaryWindowHeight" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["primaryWindowHeight"] = 800;
				}
				else if(!("primaryWindowFullscreen" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["primaryWindowFullscreen"] = false;
				}
				else if(!("secondaryWindowWidth" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["secondaryWindowWidth"] = 1400;
				}
				else if(!("secondaryWindowHeight" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["secondaryWindowHeight"] = 1000;
				}
				else if(!("secondaryWindowFullscreen" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["secondaryWindowFullscreen"] = false;
				}
				else if(!("icon" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["icon"] = "white";
				}
				else if(!("autosave" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["autosave"] = "3";
				}
				else if(!("update" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["update"] = true;
				}
				else if(!("active" in curConfigObj[typeArr[t]])) {
					curConfigObj[typeArr[t]]["active"] = { "anime": true, "book": true, "film": true, "manga": true, "show": true };
				}
			}
			fs.writeFileSync(path.join(dir, "Trak", "config", "configuration.json"), JSON.stringify(curConfigObj), "UTF8");
		}
	});
};



/*

Determines whether a given color represents a dark or light one.

    - color is a string corresponding to a color value, whether in hex or rgb.

*/
exports.lightOrDark = color => {
	// Define the variables the for red, green, blue values.
    let r = 0, g = 0, b = 0, hsp = 0;
    // Check the format of the color input.
    if(color.match(/^rgb/)) {
    	color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    	r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    // Using the hsp value, determine whether the color is light or dark.
    return hsp > 127.5 ? "light" : "dark";
};



/*

Handles the parsing of a record folder name to display.

    - folder is the string representing the name of the folder associated to a record.

*/
exports.parseRecord = folder => {
    let hldr = folder.split("-")[0];
    return nameStr = hldr.toLowerCase() + " " + folder.substring(hldr.length + 1);
};



/*

Formats a string into a proper folder name by removing forbidden characters and whitespaces.

   - str is the string representing a candidate for a folder name. 

*/
exports.formatFolderName = str => str.replace(/[/\\?%*:|"<>]/g, "_").replace(/\#/g, "_").replace(/\,/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("");



/*

Downloads images associated to a record and returns an array to their location.

	- path and fs provide the means to work with local files.
	- https provides the means to download files.
	- dir is the path to the local user data.
	- recordDir is the folder name associated to the record.
	- providedImgs is the image data provided by the front-end user submission for record save/update.
	- recPath is a string corresponding to the folder name under which the record exists.

*/
exports.objCreationImgs = (path, fs, https, dir, recordDir, providedImgs, recPath = "data") => {
	let imgArr = [];
	if(providedImgs[0] == false && providedImgs[1][0] != "") {
		for(let y = 0; y < providedImgs[1].length; y++) {
			if(exports.isURL(providedImgs[1][y])) {
				let downloadFilePath = path.join(dir, "Trak", recPath, recordDir, "assets", exports.parseURLFilename(providedImgs[1][y]));
		        imgArr.push(downloadFilePath);
				https.get(providedImgs[1][y], res => {
				    let filePath = fs.createWriteStream(downloadFilePath);
				    res.pipe(filePath);
				    filePath.on("finish", () => { filePath.close(); });
				});
			}
			else {
				let copyFilePath = path.join(dir, "Trak", recPath, recordDir, "assets", path.basename(providedImgs[1][y]));
				if(providedImgs[1][y] != copyFilePath) {
					if(fs.existsSync(providedImgs[1][y])) {
						fs.copySync(providedImgs[1][y], copyFilePath);
					}
				}
				imgArr.push(copyFilePath);
			}
		}
	}
	else { imgArr = providedImgs[1]; }
	return imgArr;
};



/*

Creates an object associated to a record in order to save/update.

   - path and fs provide the means to work with local files.
   - https provides the means to download files.
   - dir is the path to the local user data.
   - providedData is the data provided by the front-end user submission for anime record save/update.
   - extension is a string to be added onto a record's folder name.

*/
exports.recordObjCreation = (path, fs, https, dir, providedData, extension) => {
    // Define the folder name of the current record.
    let cur = providedData[0] + "-";
    cur += ((providedData[0] == "Anime" || providedData[0] == "Manga")
    	? exports.formatFolderName(providedData[1] != "" ? providedData[1] : providedData[2])
    	: exports.formatFolderName(providedData[1]));
    cur += "-" + (providedData[0] == "Book" ? providedData[3] : extension);
    // Define the indices associated to the image and related content material submission.
    let imgIndex = 0,
    	contentIndex = 0;
    if(providedData[0] == "Anime") { imgIndex = 14; contentIndex = 12; }
    else if(providedData[0] == "Book" || providedData[0] == "Manga") { imgIndex = 15; }
    else if(providedData[0] == "Film") { imgIndex = 20; }
    else if(providedData[0] == "Show") { imgIndex = 19; contentIndex = 20; }
    // Define the record object containing the parameters common to all record types.
    const recordObj = {
        "category": providedData[0],
        "name": providedData[1],
        "img": exports.objCreationImgs(path, fs, https, dir, cur, providedData[imgIndex])
    };
    // Modify the record object accordingly for an anime record.
    if(providedData[0] == "Anime") {
	    recordObj.jname = providedData[2];
	    recordObj.review = providedData[3];
	    recordObj.directors = providedData[4];
	    recordObj.producers = providedData[5];
	    recordObj.writers = providedData[6];
	    recordObj.musicians = providedData[7];
	    recordObj.studio = providedData[8];
	    recordObj.license = providedData[9];
	    recordObj.genres = providedData[11];
	    recordObj.synopsis = providedData[13];
	    recordObj.bookmark = providedData[15];
	    recordObj.season = providedData[16];
	    recordObj.year = providedData[17];
	    recordObj.content = [];
    }
    // Modify the record object accordingly for a book record.
    else if(providedData[0] == "Book") {
    	recordObj.originalName = providedData[2];
        recordObj.isbn = providedData[3];
        recordObj.authors = providedData[4];
        recordObj.publisher = providedData[5];
        recordObj.publicationDate = providedData[6];
        recordObj.pages = providedData[7];
        recordObj.read = providedData[8];
        recordObj.media = providedData[9];
        recordObj.synopsis = providedData[11];
        recordObj.rating = providedData[12];
        recordObj.review = providedData[13];
        recordObj.genres = providedData[14];
        recordObj.bookmark = providedData[16];
    }
    // Modify the record object accordingly for a film record.
    else if(providedData[0] == "Film") {
    	recordObj.alternateName = providedData[2];
    	recordObj.review = providedData[3];
    	recordObj.directors = providedData[4];
    	recordObj.producers = providedData[5];
    	recordObj.writers = providedData[6];
    	recordObj.musicians = providedData[7];
    	recordObj.editors = providedData[8];
    	recordObj.cinematographers = providedData[9];
    	recordObj.distributors = providedData[11];
    	recordObj.productionCompanies = providedData[12];
    	recordObj.stars = providedData[13];
    	recordObj.genres = providedData[14];
    	recordObj.synopsis = providedData[15];
    	recordObj.rating = providedData[16];
    	recordObj.release = providedData[17];
    	recordObj.runTime = providedData[18];
    	recordObj.watched = providedData[19];
    	recordObj.bookmark = providedData[21];
    }
    // Modify the record object accordingly for a manga record.
    else if(providedData[0] == "Manga") {
    	recordObj.jname = providedData[2];
        recordObj.review = providedData[3];
        recordObj.writers = providedData[4];
        recordObj.illustrators = providedData[5];
        recordObj.publisher = providedData[6];
        recordObj.jpublisher = providedData[7];
        recordObj.demographic = providedData[8];
        recordObj.start = providedData[9];
        recordObj.end = providedData[11];
        recordObj.genres = providedData[13];
        recordObj.synopsis = providedData[14];
        recordObj.bookmark = providedData[16];
        recordObj.content = [];
        // Add the related content for the manga record.
	    for(let m = 0; m < providedData[12].length; m++) {
	        if(providedData[12][m][0] == "Chapter") {
	            recordObj.content.push({
	                "scenario": providedData[12][m][0],
	                "name": providedData[12][m][1],
	                "release": providedData[12][m][2],
	                "read": providedData[12][m][3],
	                "rating": providedData[12][m][4],
	                "review": providedData[12][m][5]
	            });
	        }
	        else if(providedData[12][m][0] == "Volume") {
	            recordObj.content.push({
	                "scenario": providedData[12][m][0],
	                "name": providedData[12][m][1],
	                "release": providedData[12][m][2],
	                "read": providedData[12][m][3],
	                "rating": providedData[12][m][4],
	                "review": providedData[12][m][5],
	                "isbn": providedData[12][m][6],
	                "synopsis": providedData[12][m][7]
	            });
	        }
	    }
    }
    // Modify the record object accordingly for a show record.
    else if(providedData[0] == "Show") {
    	recordObj.alternateName = providedData[2];
        recordObj.review = providedData[3];
        recordObj.directors = providedData[4];
        recordObj.producers = providedData[5];
        recordObj.writers = providedData[6];
        recordObj.musicians = providedData[7];
        recordObj.editors = providedData[8];
        recordObj.cinematographers = providedData[9];
        recordObj.distributors = providedData[11];
        recordObj.productionCompanies = providedData[12];
        recordObj.stars = providedData[13];
        recordObj.genres = providedData[14];
        recordObj.synopsis = providedData[15];
        recordObj.rating = providedData[16];
        recordObj.release = providedData[17];
        recordObj.runTime = providedData[18];
        recordObj.bookmark = providedData[21];
        recordObj.content = [];
    }
    // For anime and show record types add the related content.
    if(providedData[0] == "Anime" || providedData[0] == "Show") {
	    for(let m = 0; m < providedData[contentIndex].length; m++) {
	        if(providedData[contentIndex][m][0] == "Single") {
	            recordObj.content.push({
	                "scenario": providedData[contentIndex][m][0],
	                "name": providedData[contentIndex][m][1],
	                "type": providedData[contentIndex][m][2],
	                "release": providedData[contentIndex][m][3],
	                "watched": providedData[contentIndex][m][4],
	                "rating": providedData[contentIndex][m][5],
	                "review": providedData[contentIndex][m][6]
	            });
	        }
	        else if(providedData[contentIndex][m][0] == "Season") {
	            let recordSeasonObj = {
	                "scenario": providedData[contentIndex][m][0],
	                "name": providedData[contentIndex][m][1],
	                "start": providedData[contentIndex][m][2],
	                "end": providedData[contentIndex][m][3],
	                "status": providedData[contentIndex][m][4],
	                "episodes": []
	            };
	            for(let n = 0; n < providedData[contentIndex][m][5].length; n++) {
	                recordSeasonObj.episodes.push({
	                    "name": providedData[contentIndex][m][5][n][0],
	                    "watched": providedData[contentIndex][m][5][n][1],
	                    "rating": providedData[contentIndex][m][5][n][2],
	                    "review": providedData[contentIndex][m][5][n][3]
	                });
	            }
	            recordObj.content.push(recordSeasonObj);
	        }
	    }
    }
    return recordObj;
};



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
	- autoCheck is a boolean representing whether the data file is being written corresponding to an application autosave.
	- curFldr is a string corresponding to the folder name of the current record.

*/
exports.writeDataFile = (log, globalWin, curWin, writeData, mode, savePath, fs, path, evt, info, autoCheck, curFldr = "") => {
	let fldr = "";
	const modeStr = (mode == "A" ? "add" : "update");
	if(info[0] == "Anime" || info[0] == "Manga") {
		if(curFldr != "") { fldr = curFldr; }
		else {
			fldr = info[0] + "-" + exports.formatFolderName(info[1] != "" ? info[1] : info[2]);
			fldr += "-" + (fs.readdirSync(path.join(savePath, "Trak", "data")).filter(file => fs.statSync(path.join(savePath, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-") == fldr).length - 1);
		}
	}
	else if(info[0] == "Book") {
		fldr = info[0] + "-" + exports.formatFolderName(info[1]) + "-" + info[3];
	}
	else if(info[0] == "Film" || info[0] == "Show") {
		if(curFldr != "") { fldr = curFldr; }
		else {
			fldr = info[0] + "-" + exports.formatFolderName(info[1]);
			fldr += "-" + (fs.readdirSync(path.join(savePath, "Trak", "data")).filter(file => fs.statSync(path.join(savePath, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-") == fldr).length - 1);
		}
	}
	if(mode == "U" && writeData.img[0] != "") { writeData.img = writeData.img.map(file => path.join(savePath, "Trak", "data", fldr, "assets", path.basename(file))); }
	fs.writeFile(path.join(savePath, "Trak", "data", fldr, "data.json"), JSON.stringify(writeData), "UTF8", err => {
		// If there was an error in writing to the data file, then notify the user.
		if(err) {
			if(info[0] == "Anime" || info[0] == "Manga") {
				log.error("There was an issue in writing the data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
				evt.sender.send("writeRecordFailure", fldr);
			}
			else if(info[0] == "Book") {
				log.error("There was an issue in writing the data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
				evt.sender.send("writeRecordFailure", info[0] + "-" + (info[1] != "" ? info[1] : info[3]));
			}
			else if(info[0] == "Film" || info[0] == "Show") {
				log.error("There was an issue in writing the data file associated to the " + info[0].toLowerCase() + " " + info[1] + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
				evt.sender.send("writeRecordFailure", info[0] + "-" + info[1]);
			}
		}
		else {
			if(info[0] == "Anime" || info[0] == "Manga") {
				log.info("The data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]) + " has been successfully " + (modeStr == "A" ? "created and saved." : "updated."));
			}
			else if(info[0] == "Book") {
				log.info("The data file associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]) + " has been successfully " + (modeStr == "A" ? "created and saved." : "updated."));
			}
			else if(info[0] == "Film" || info[0] == "Show") {
				log.info("The data file associated to the " + info[0].toLowerCase() + " " + info[1] + " has been successfully " + (modeStr == "A" ? "created and saved." : "updated."));
			}
			// Copy over the files asked to be added as assets in association to a particular record.
			let i = 0;
			for(; i < info[10].length; i++) {
				let dest = path.join(savePath, "Trak", "data", fldr, "assets", path.basename(info[10][i]));
				fs.copyFile(info[10][i], dest, cpErr => {
					if(cpErr) {
						log.error("There was an issue in copying over the file " + info[10][i] + " as an asset. Error Type: " + cpErr.name + ". Error Message: " + cpErr.message + ".");
						evt.sender.send("copyFailure", info[10][i]);
					}
				});
			}
			// Once all of the files have been updated, notify the user everything has been taken care of and close the window if necessary.
			if(i == info[10].length) {
				if(info[0] == "Anime" || info[0] == "Manga") {
					log.info("All assets associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[2]) + " have been copied over.");
				}
				else if(info[0] == "Book") {
					log.info("All assets associated to the " + info[0].toLowerCase() + " " + (info[1] != "" ? info[1] : info[3]) + " have been copied over.");
				}
				else if(info[0] == "Film" || info[0] == "Show") {
					log.info("All assets associated to the " + info[0].toLowerCase() + " " + info[1] + " have been copied over.");
				}
				globalWin.reload();
				if(info[0] == "Anime" || info[0] == "Manga") {
					evt.senderFrame.send(modeStr + "RecordSuccess", [info[0] + "-" + (info[1] != "" ? info[1] : info[2]), autoCheck]);
				}
				else if(info[0] == "Book") {
					evt.senderFrame.send(modeStr + "RecordSuccess", [info[0] + "-" + (info[1] != "" ? info[1] : info[3]), autoCheck]);
				}
				else if(info[0] == "Film" || info[0] == "Show") {
					evt.senderFrame.send(modeStr + "RecordSuccess", [info[0] + "-" + info[1], autoCheck]);
				}
				if(autoCheck == false) {
					setTimeout(() => { curWin.destroy(); }, 2000);
				}
			}
		}
	});
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
				log.error("There was an issue removing the data record associated to the " + data[j].split("-")[0].toLowerCase() + " " + data[j].substring(data[j].split("-")[0].length + 1) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
				primaryWin.webContents.send("recordRemovalFailure", data[j]);
			}
		});
	}
	// Refresh the primary window and notify the user that all checked records have been removed.
	if(j == data.length) {
		log.info("The data records associated to the folders " + data.join(", ") + (data.length > 1 ? " have" : " has") + " been deleted.");
		primaryWin.reload();
		setTimeout(() => { primaryWin.webContents.send("recordsRemovalSuccess"); }, 500);
	}
};



/*

Moves an element in an array.

    - arr is the array in which the desired element will be moved.
    - fromIndex is the current position of the element which will be moved.
    - toIndex is the final position to which the element will be moved.

*/
exports.arrayMove = (arr, fromIndex, toIndex) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
};



/*

Provides the list of all genres/tags that can be selected on the addRecord.html page for a record.

*/
exports.genreList = recType => {
    let genArr = [];
    if(recType == "Anime") {
	    genArr = ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Mystery", "Magic",
            "MagicalSexShift", "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police",
            "PostApocalyptic", "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai",
            "School", "SciFi", "Seinen", "Shoujo", "Shounen", "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame",
            "SuperPower", "Supernatural", "Survival", "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy",
            "Vampire", "VideoGame", "War", "Western", "Workplace", "Yaoi", "Yuri"];
    }
    else if(recType == "Book") {
    	genArr = ["Action", "Adventure", "Comedy", "Crime", "Dystopian", "Fantasy", "Fiction", "Historical", "Horror", "Mystery",
            "Mythology", "Nonfiction", "Romance", "Satire", "Sci-Fi", "Thriller", "Tragedy", "Western"];
    }
    else if(recType == "Film") {
    	genArr = ["Action", "Adventure", "AlternateHistory", "Amateur", "Animation", "Anthology", "Art", "Biopic", "Comedy",
    		"Crime", "Cyberpunk", "Detective", "Docudrama", "Documentary", "Drama", "Dystopian", "Fantasy", "Gangster", "Ghost",
    		"Gore", "Gothic", "Heist", "Historical", "Holiday", "Horror", "Instructional", "Military", "Monster", "Musical",
            "Mystery", "Nature", "Paranormal", "Parody", "Political", "PostApocalyptic", "Psychological", "Reality", "Religious",
            "Revisionist", "Romance", "Satire", "SciFi", "Space", "SpaceOpera", "Sports", "Spy", "StopMotion", "Superhero",
            "Thriller", "Utopian", "Vampire", "Vigilante", "Western", "Zombie"];
    }
    else if(recType == "Manga") {
    	genArr = ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Kids", "Medical", "Mystery", "Magic", "MagicalSexShift",
            "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police", "PostApocalyptic",
            "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai", "School", "SciFi",
            "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame", "SuperPower", "Supernatural", "Survival",
            "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy", "Vampire", "VideoGame", "War", "Western",
            "Workplace", "Yaoi", "Yuri"];
    }
    else if(recType == "Show") {
    	genArr = ["Action", "Adventure", "AlternateHistory", "Amateur", "Animation", "Anthology", "Art", "Biopic", "Comedy",
            "CookingShow", "Crime", "Cyberpunk", "Detective", "Docudrama", "Documentary", "Drama", "Dystopian", "Fantasy", "GameShow",
            "Gangster", "Ghost", "Gore", "Gothic", "Heist", "Historical", "Holiday", "Horror", "Instructional", "Military", "Monster",
            "Musical", "Mystery", "Nature", "Paranormal", "Parody", "Political", "PostApocalyptic", "Psychological", "Reality",
            "Religious", "Revisionist", "Romance", "Satire", "SciFi", "Space", "SpaceOpera", "Sports", "Spy", "StopMotion",
            "Superhero", "TalkShow", "Thriller", "Utopian", "Vampire", "Vigilante", "Western", "Zombie"];
    }
    return genArr;
};



/*

Calculate the earliest release date of an anime record based on the related content information.

	- contentArr is an array containing the related content details for a library record.

*/ 
exports.calculateReleaseDate = contentArr => {
	// Define the variable which will represent the earliest release date.
	let candidate = "";
	// Iterate through all record related content.
	for(let z = 0; z < contentArr.length; z++) {
		let candidateHolder = "";
		// If the related content entry has a start or release date then save it to compare to the current earliest date.
		if((contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release) != "") {
			candidateHolder = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
		}
		// If the current earliest date has not been defined yet, then set it to the current start or release date.
		if(candidate == "" && candidateHolder != "") {
			candidate = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
		}
		// Compare the current earliest date and compare it to the current related content date.
		else if(candidate != "" && candidateHolder != "") {
			// Update the earliest date if the new date found references an earlier date.
			if(candidateHolder < candidate) {
				candidate = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
			}
		}
	}
	// Return the earliest date found or N/A if none were found.
	return candidate != "" ? candidate.toJSON().split("T")[0] : "N/A";
};



/*

Calculate the average rating of an anime record based on the related content information.

	- contentArr is an array containing the related content details for a library record.

*/ 
exports.calculateAnimeGlobalRating = contentArr => {
	// Define the sum of all related content ratings and count of how many are used in the sum.
	let overallSum = 0,
		overallCount = 0;
	// Iterate through all record related content.
	for(let r = 0; r < contentArr.length; r++) {
		// If the entry in the related content is a season then calculate the average rating of the season and count it towards the sum and count.
		if(contentArr[r].scenario == "Season" && contentArr[r].episodes.length > 0) {
			let seasonSum = 0,
				seasonCount = 0;
			for(let s = 0; s < contentArr[r].episodes.length; s++) {
				if(contentArr[r].episodes[s].rating != "") {
					seasonSum += parseInt(contentArr[r].episodes[s].rating);
					seasonCount++;
				}
			}
			if(seasonCount > 0) {
				overallSum += (seasonSum / seasonCount);
				overallCount++;
			}
		}
		// If the entry in the related content is a single then add the rating of the item to the sum and count.
		else if(contentArr[r].scenario == "Single" && contentArr[r].rating != "") {
			overallSum += parseInt(contentArr[r].rating);
			overallCount++;
		}
	}
	// Return the anime record global rating if the count is non-zero, otherwise provide N/A.
	return overallCount != 0 ? String((overallSum / overallCount).toFixed(2)) : "N/A";
};



/*

Calculate the average rating of a manga record based on the related content information.

	- contentArr is an array containing the related content details for a library record.

*/ 
exports.calculateMangaGlobalRating = contentArr => {
	// Define the arrays of all related content ratings.
	let chapterArr = [],
		volumeArr = [];
	// Iterate through all record related content.
	for(let r = 0; r < contentArr.length; r++) {
		// If the entry in the related content is a chapter then add the rating of the item to the associated array.
		if(contentArr[r].scenario == "Chapter" && contentArr[r].rating != "") {
			chapterArr.push(parseInt(contentArr[r].rating));
		}
		// Otherwise if the entry in the related content is a volume then add the rating of the item to the associated array.
		else if(contentArr[r].scenario == "Volume" && contentArr[r].rating != "") {
			volumeArr.push(parseInt(contentArr[r].rating));
		}
	}
	// Return the manga record global rating if the count is non-zero, otherwise provide N/A.
	return chapterArr.length + volumeArr.length == 0 ? "N/A" : (((chapterArr.length == 0 ? 0 : (chapterArr.reduce((accum, cur) => accum + cur, 0) / chapterArr.length))
        + (volumeArr.length == 0 ? 0 : (volumeArr.reduce((accum, cur) => accum + cur, 0) / volumeArr.length))) / (chapterArr.length != 0 && volumeArr.length != 0 ? 2 : 1)).toFixed(2);
};



/*

Calculate the average rating of a show record based on the related content information.

	- contentArr is an array containing the related content details for a library record.

*/ 
exports.calculateShowGlobalRating = contentArr => {
	// Define the sum of all related content ratings and count of how many are used in the sum.
	let overallSum = 0,
		overallCount = 0;
	// Iterate through all record related content.
	for(let r = 0; r < contentArr.length; r++) {
		// Calculate the average rating of the season and count it towards the sum and count.
		if(contentArr[r].episodes.length > 0) {
			let seasonSum = 0,
				seasonCount = 0;
			for(let s = 0; s < contentArr[r].episodes.length; s++) {
				if(contentArr[r].episodes[s].rating != "") {
					seasonSum += parseInt(contentArr[r].episodes[s].rating);
					seasonCount++;
				}
			}
			if(seasonCount > 0) {
				overallSum += (seasonSum / seasonCount);
				overallCount++;
			}
		}
	}
	// Return the show record global rating if the count is non-zero, otherwise provide N/A.
	return overallCount != 0 ? String((overallSum / overallCount).toFixed(2)) : "N/A";
};



/*

Formats the media type of a book record.

	- val is the media type associated to a book record.

*/ 
exports.formatMedia = val => {
	let mediaText = "";
	if(val == "audiobook") { mediaText = "Audiobook"; }
	else if(val == "ebook") { mediaText = "eBook"; }
	else if(val == "hardcover") { mediaText = "Hardcover"; }
	else if(val == "softcover") { mediaText = "Softcover"; }
	else { mediaText = "N/A"; }
	return mediaText;
};



/*

Formats a string into a proper ISBN by adding hyphens.

   - val is the string to be formatted.

*/
exports.formatISBNString = val => {
    let curVal = "";
    if(/^[0-9]+$/.test(val)) {
        if(val.length < 4) { curVal = val; }
        else if(val.length == 4) { curVal = val.slice(0, 3) + "-" + val.slice(3); }
        else if(val.length < 10) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4); }
        else if(val.length == 10) { curVal = val.slice(0, 1) + "-" + val.slice(1, 6) + "-" + val.slice(6, 9) + "-" + val.slice(9, 10); }
        else if(val.length < 13) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9); }
        else { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9, 12) + "-" + val.slice(12, 13); }
    }
    else { curVal = val.slice(0, 10); }
    return curVal;
};



/*

Create a xlsx file containing the exported library records along with a zip of the associated assets.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- zipper is a library object which can create zip files.
	- ExcelJS provides the means to export/import xlsx files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- exportLocation is a string representing the location where the generated zip file will be placed.
	- records is the list of items which the user desires to export.
	- detailed is a boolean representing whether the xlsx file should contain only basic details or everything.
	- compressionVal is a boolean representing whether the zip file should be compressed.

*/ 
exports.exportDataXLSX = (fs, path, log, zipper, ExcelJS, eve, dir, exportLocation, records, detailed = false, compressionVal = false) => {
	log.info("The XLSX export process has started.");
	// If the exportTemp folder does not exist, then create it.
	const exportTempFolder = path.join(dir, "Trak", "exportTemp");
	if(!fs.existsSync(exportTempFolder)) {
		log.info("Creating the exportTemp folder. To be located at " + exportTempFolder);
		fs.mkdirSync(exportTempFolder);
	}
	// Otherwise empty it.
	else {
		log.info("Emptying the exportTemp folder.");
		fs.emptyDirSync(exportTempFolder);
	}
	// If the export folder does not exist, then create it.
	const fileDateArr = (new Date().toJSON().slice(0, 10)).split("-"),
		fileDate = fileDateArr[1] + "." + fileDateArr[2] + "." + fileDateArr[0],
		xlsxExportFolder = path.join(exportLocation, "Trak-" + (detailed == true ? "Detailed-" : "Simple-") + "XLSX-Export-" + fileDate);
	if(!fs.existsSync(xlsxExportFolder)) {
		log.info("Creating the xlsx export folder. To be located at " + xlsxExportFolder)
		fs.mkdirSync(xlsxExportFolder);
	}
	// Otherwise empty it.
	else {
		log.info("Emptying the xlsx export folder.");
		fs.emptyDirSync(xlsxExportFolder);
	}
	// Read the settings configuration file.
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
		// If there was an issue reading the settings configuration file notify the user.
		if(err) {
			log.error("There was an issue in reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
			eve.sender.send("configurationFileOpeningFailure");
		}
		else {
			log.info("The settings configuration file has been successfully read.");
			// Define the configuration file data, associated library records path, and create a xlsx workbook.
			const fileData = JSON.parse(fileContent),
				dataPath = fileData.current != undefined ? fileData.current.path : fileData.original.path,
				workbook = new ExcelJS.Workbook();
			// Define parameters pertaining to the workbook.
			workbook.creator = "Trak";
			workbook.created = new Date();
			// Define the anime worksheet.
			const animeWorksheet = workbook.addWorksheet("Category-Anime"),
				bookWorksheet = workbook.addWorksheet("Category-Book"),
				filmWorksheet = workbook.addWorksheet("Category-Film"),
				mangaWorksheet = workbook.addWorksheet("Category-Manga"),
				showWorksheet = workbook.addWorksheet("Category-Show");
			// Define the default views, alignment, border styles, and font parameter objects.
			const viewsParameters = {"state": "frozen", "xSplit": 1, "ySplit": 1, "activeCell": "A2"},
				alignmentMidCenParameters = { "vertical": "middle", "horizontal": "center" },
				alignmentMidCenWrapParameters = { "vertical": "middle", "horizontal": "center", "wrapText": true },
				alignmentMidLefWrapParameters = { "vertical": "middle", "horizontal": "left", "wrapText": true },
				fontLargeBoldParameters = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true },
				fontSmallParameters = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false },
				styleObj = { "top": { "style": "thin" }, "left": { "style": "thin" }, "bottom": { "style": "thin" }, "right": { "style": "thin" }};
			animeWorksheet.views = [viewsParameters];
			bookWorksheet.views = [viewsParameters];
			filmWorksheet.views = [viewsParameters];
			mangaWorksheet.views = [viewsParameters];
			showWorksheet.views = [viewsParameters];
			// Update the style of the first row.
			animeWorksheet.getRow(1).height = 20;
			bookWorksheet.getRow(1).height = 20;
			filmWorksheet.getRow(1).height = 20;
			mangaWorksheet.getRow(1).height = 20;
			showWorksheet.getRow(1).height = 20;
			animeWorksheet.getRow(1).alignment = alignmentMidCenParameters;
			bookWorksheet.getRow(1).alignment = alignmentMidCenParameters;
			filmWorksheet.getRow(1).alignment = alignmentMidCenParameters;
			mangaWorksheet.getRow(1).alignment = alignmentMidCenParameters;
			showWorksheet.getRow(1).alignment = alignmentMidCenParameters;
			// Define the default border styles object.
			animeWorksheet.getRow(1).border = styleObj;
			bookWorksheet.getRow(1).border = styleObj;
			filmWorksheet.getRow(1).border = styleObj;
			mangaWorksheet.getRow(1).border = styleObj;
			showWorksheet.getRow(1).border = styleObj;
			animeWorksheet.getRow(1).font = fontLargeBoldParameters;
			bookWorksheet.getRow(1).font = fontLargeBoldParameters;
			filmWorksheet.getRow(1).font = fontLargeBoldParameters;
			mangaWorksheet.getRow(1).font = fontLargeBoldParameters;
			showWorksheet.getRow(1).font = fontLargeBoldParameters;
			// Construct the column headers.
			animeWorksheet.columns = [
			  	{ "header": "Name", "width": 40},
			  	{ "header": "Japanese Name", "width": 30 },
			  	{ "header": "Rating", "width": 10 },
			  	{ "header": "Comments/Review", "width": 125 },
			  	{ "header": "Synopsis", "width": 125 },
			  	{ "header": "Directors", "width": 30 },
			  	{ "header": "Producers", "width": 30 },
			  	{ "header": "Writers", "width": 30 },
			  	{ "header": "Music Directors", "width": 30 },
			  	{ "header": "Studios", "width": 30 },
			  	{ "header": "Licensed By", "width": 30 },
			  	{ "header": "Release Date", "width": 15 },
			  	{ "header": "Premiered", "width": 15 },
			  	{ "header": "Genres", "width": 40 },
			];
			bookWorksheet.columns = [
			  	{ "header": "Title", "width": 40},
			  	{ "header": "Original Title", "width": 30 },
			  	{ "header": "Rating", "width": 10 },
			  	{ "header": "Comments/Review", "width": 125 },
			  	{ "header": "Synopsis", "width": 125 },
			  	{ "header": "ASIN/ISBN", "width": 25 },
			  	{ "header": "Authors", "width": 30 },
			  	{ "header": "Publisher", "width": 30 },
			  	{ "header": "Publication Date", "width": 25 },
			  	{ "header": "Number of Pages", "width": 20 },
			  	{ "header": "Media Type", "width": 30 },
			  	{ "header": "Last Read Date", "width": 25 },
			  	{ "header": "Genres", "width": 40 },
			];
			filmWorksheet.columns = [
			  	{ "header": "Name", "width": 40},
			  	{ "header": "Alternate Name", "width": 30 },
			  	{ "header": "Rating", "width": 10 },
			  	{ "header": "Comments/Review", "width": 125 },
			  	{ "header": "Plot", "width": 125 },
			  	{ "header": "Runtime", "width": 25 },
			  	{ "header": "Directors", "width": 30 },
			  	{ "header": "Editors", "width": 30 },
			  	{ "header": "Writers", "width": 30 },
			  	{ "header": "Cinematographers", "width": 30 },
			  	{ "header": "Music Directors", "width": 30 },
			  	{ "header": "Distributors", "width": 30 },
			  	{ "header": "Producers", "width": 30 },
			  	{ "header": "Production Companies", "width": 30 },
			  	{ "header": "Starring", "width": 30 },
			  	{ "header": "Release Date", "width": 25 },
			  	{ "header": "Last Watched Date", "width": 25 },
			  	{ "header": "Genres", "width": 40 },
			];
			mangaWorksheet.columns = [
			  	{ "header": "Name", "width": 40},
			  	{ "header": "Japanese Name", "width": 30 },
			  	{ "header": "Rating", "width": 10 },
			  	{ "header": "Comments/Review", "width": 125 },
			  	{ "header": "Synopsis", "width": 125 },
			  	{ "header": "Writers", "width": 30 },
			  	{ "header": "Illustrators", "width": 30 },
			  	{ "header": "Publisher", "width": 30 },
			  	{ "header": "Japanese Publisher", "width": 30 },
			  	{ "header": "Demographic", "width": 30 },
			  	{ "header": "Start Date", "width": 30 },
			  	{ "header": "End Date", "width": 15 },
			  	{ "header": "Genres", "width": 40 },
			];
			showWorksheet.columns = [
			  	{ "header": "Name", "width": 40},
			  	{ "header": "Alternate Name", "width": 30 },
			  	{ "header": "Rating", "width": 10 },
			  	{ "header": "Comments/Review", "width": 125 },
			  	{ "header": "Plot", "width": 125 },
			  	{ "header": "Runtime", "width": 25 },
			  	{ "header": "Directors", "width": 30 },
			  	{ "header": "Editors", "width": 30 },
			  	{ "header": "Writers", "width": 30 },
			  	{ "header": "Cinematographers", "width": 30 },
			  	{ "header": "Music Directors", "width": 30 },
			  	{ "header": "Distributors", "width": 30 },
			  	{ "header": "Producers", "width": 30 },
			  	{ "header": "Production Companies", "width": 30 },
			  	{ "header": "Starring", "width": 30 },
			  	{ "header": "Release Date", "width": 25 },
			  	{ "header": "Genres", "width": 40 },
			];
			// Define the function which handles attaching a record's name to a worksheet.
			const worksheetItemName = (sheet, counter, val) => {
				sheet.getRow(counter + 2).alignment = alignmentMidLefWrapParameters;
				sheet.getRow(counter + 2).height = 75;
				sheet.getRow(counter + 2).font = fontSmallParameters;
				sheet.getCell("A" + (counter + 2)).font = fontLargeBoldParameters;
				sheet.getCell("A" + (counter + 2)).border = styleObj;
				sheet.getCell("A" + (counter + 2)).value = val;
			};
			// Define the function which handles attaching a date item for a record to a worksheet.
			const worksheetDateItem = (sheet, dateCell, counter, valArr) => {
				sheet.getCell(dateCell + (counter + 2)).alignment = alignmentMidCenWrapParameters;
				sheet.getCell(dateCell + (counter + 2)).value = valArr.length == 3 ? valArr[1] + "-" + valArr[2] + "-" + valArr[0] : "N/A";
			};
			// Define the function which handles attaching a record's genres/tags to a worksheet.
			const genreCellFill = (sheet, genLst, genCell, counter) => {
				let filterGenreStrArr = [];
				for(let f = 0; f < genLst[0].length; f++) {
					if(genLst[1][f] == true) {
			            if(genLst[0][f] == "CGDCT") {
			                filterGenreStrArr.push("CGDCT");
			            }
			            else if(genLst[0][f] == "ComingOfAge") {
			                filterGenreStrArr.push("Coming-of-Age");
			            }
			            else if(genLst[0][f] == "PostApocalyptic") {
			                filterGenreStrArr.push("Post-Apocalyptic");
			            }
			            else if(genLst[0][f] == "SciFi") {
			                filterGenreStrArr.push("Sci-Fi");
			            }
			            else if(genLst[0][f] == "SliceOfLife") {
			                filterGenreStrArr.push("Slice of Life");
			            }
			            else {
			                filterGenreStrArr.push(genLst[0][f].split(/(?=[A-Z])/).join(" "));
			            }
					}
				}
				filterGenreStrArr = filterGenreStrArr.concat(genLst[2]);
				filterGenreStrArr.sort((a, b) => a.localeCompare(b));
				sheet.getCell(genCell + (counter + 2)).value = filterGenreStrArr.length > 0 ? filterGenreStrArr.filter(elem => elem.trim() != "").join(", ") : "N/A";
			};
			// Iterate through all records the user desires to export.
			let animeRowCounter = 0,
				bookRowCounter = 0,
				filmRowCounter = 0,
				mangaRowCounter = 0,
				showRowCounter = 0;
			for(let x = 0; x < records.length; x++) {
				// Define the data associated to a record.
				let iterData = JSON.parse(fs.readFileSync(path.join(dataPath, records[x], "data.json"), "UTF8"));
				// Generate the worksheets associated to anime library records.
				if(iterData.category == "Anime") {
					// Update each row with the relevant anime record details on the anime worksheet.
					worksheetItemName(animeWorksheet, animeRowCounter, iterData.name);
					animeWorksheet.getCell("B" + (animeRowCounter + 2)).value = iterData.jname != "" ? iterData.jname : "N/A";
					animeWorksheet.getCell("C" + (animeRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					animeWorksheet.getCell("C" + (animeRowCounter + 2)).value = exports.calculateAnimeGlobalRating(iterData.content);
					animeWorksheet.getCell("D" + (animeRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					animeWorksheet.getCell("E" + (animeRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					animeWorksheet.getCell("F" + (animeRowCounter + 2)).value = iterData.directors != "" ? iterData.directors : "N/A";
					animeWorksheet.getCell("G" + (animeRowCounter + 2)).value = iterData.producers != "" ? iterData.producers : "N/A";
					animeWorksheet.getCell("H" + (animeRowCounter + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					animeWorksheet.getCell("I" + (animeRowCounter + 2)).value = iterData.musicians != "" ? iterData.musicians : "N/A";
					animeWorksheet.getCell("J" + (animeRowCounter + 2)).value = iterData.studio != "" ? iterData.studio : "N/A";
					animeWorksheet.getCell("K" + (animeRowCounter + 2)).value = iterData.license != "" ? iterData.license : "N/A";
					worksheetDateItem(animeWorksheet, "L", animeRowCounter, exports.calculateReleaseDate(iterData.content).split("-"));
					animeWorksheet.getCell("M" + (animeRowCounter + 2)).value = iterData.season != "" || iterData.year != "" ? iterData.season.charAt(0).toUpperCase() + iterData.season.slice(1) + " " + iterData.year : "N/A";
					animeWorksheet.getCell("M" + (animeRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					genreCellFill(animeWorksheet, iterData.genres, "N", animeRowCounter);
					// If the user desires to export a detailed xlsx file then create a new worksheet for each anime record and populate it with the related content information.
					if(detailed == true) {
						let detailedWorksheetName = iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25),
							recNum = records[x].split("-").slice(-1)[0];
						(detailedWorksheetName + "-" + recNum).length > 25
							? detailedWorksheetName = detailedWorksheetName.substring(0, detailedWorksheetName.length - (recNum.length + 1)) + "-" + recNum
							: detailedWorksheetName = detailedWorksheetName + "-" + recNum;
						// Define the worksheet associated to the anime record.
						let detailedWorksheet = workbook.addWorksheet("Anime-" + detailedWorksheetName);
						detailedWorksheet.views = [{"state": "frozen", "ySplit": 1, "activeCell": "A2"}];
						// Update the style of the first row.
						detailedWorksheet.getRow(1).height = 20;
						detailedWorksheet.getRow(1).alignment = alignmentMidCenParameters;
						detailedWorksheet.getRow(1).border = styleObj;
						detailedWorksheet.getRow(1).font = fontLargeBoldParameters;
						// Construct the column headers.
						detailedWorksheet.columns = [
						  	{ "header": "Type", "width": 20},
						  	{ "header": "Name", "width": 40 },
						  	{ "header": "Start Date", "width": 15 },
						  	{ "header": "End Date", "width": 15 },
						  	{ "header": "Status", "width": 30 },
						  	{ "header": "Last Watched", "width": 15 },
						  	{ "header": "Rating", "width": 10 },
						  	{ "header": "Episode #", "width": 15 },
						  	{ "header": "Episode Name", "width": 30 },
						  	{ "header": "Comments/Review", "width": 125 }
						];
						// Keep track of the row position in the worksheet.
						let rowPos = 2;
						// Iterate through the related content of an anime record.
						for(let v = 0; v < iterData.content.length; v++) {
							// If the related content item corresponds to a season then add all associated episodes.
							if(iterData.content[v].scenario == "Season") {
								for(let t = 0; t < iterData.content[v].episodes.length; t++) {
									detailedWorksheet.getRow(rowPos).font = fontSmallParameters;
									detailedWorksheet.getRow(rowPos).alignment = alignmentMidLefWrapParameters;
									detailedWorksheet.getRow(rowPos).height = 75;
									detailedWorksheet.getCell("A" + rowPos).value = "Season";
									detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
									worksheetDateItem(detailedWorksheet, "C", rowPos - 2, iterData.content[v].start.split("-"));
									worksheetDateItem(detailedWorksheet, "D", rowPos - 2, iterData.content[v].end.split("-"));
									detailedWorksheet.getCell("E" + rowPos).value = iterData.content[v].status != "" ? iterData.content[v].status : "N/A";
									worksheetDateItem(detailedWorksheet, "F", rowPos - 2, iterData.content[v].episodes[t].watched.split("-"));
									detailedWorksheet.getCell("G" + rowPos).alignment = alignmentMidCenParameters;
									detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].episodes[t].rating != "" ? iterData.content[v].episodes[t].rating : "N/A";
									let maxCharCount = String(iterData.content[v].episodes.length).length;
									detailedWorksheet.getCell("H" + rowPos).value = String(t + 1).length < maxCharCount ? new Array(maxCharCount - String(t + 1).length).fill("0").join("") + (t + 1) : t + 1;
									detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].episodes[t].name != "" ? iterData.content[v].episodes[t].name : "N/A";
									detailedWorksheet.getCell("J" + rowPos).value = iterData.content[v].episodes[t].review != "" ? iterData.content[v].episodes[t].review : "N/A";
									rowPos++;
								}
							}
							// Otherwise if the related content item corresponds to a single listing then add a single episode.
							else if(iterData.content[v].scenario == "Single") {
								detailedWorksheet.getRow(rowPos).font = fontSmallParameters;
								detailedWorksheet.getRow(rowPos).alignment = alignmentMidLefWrapParameters;
								detailedWorksheet.getRow(rowPos).height = 75;
								detailedWorksheet.getCell("A" + rowPos).value = iterData.content[v].type != "" ? iterData.content[v].type : "Single";
								detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								worksheetDateItem(detailedWorksheet, "C", rowPos - 2, iterData.content[v].release.split("-"));
								detailedWorksheet.getCell("D" + rowPos).alignment = alignmentMidCenWrapParameters;
								dateArr = iterData.content[v].release.split("-")
								detailedWorksheet.getCell("D" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("E" + rowPos).value = "N/A";
								worksheetDateItem(detailedWorksheet, "F", rowPos - 2, iterData.content[v].watched.split("-"));
								detailedWorksheet.getCell("G" + rowPos).alignment = alignmentMidCenParameters;
								detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].rating != "" ? iterData.content[v].rating : "N/A";
								detailedWorksheet.getCell("H" + rowPos).value = "1";
								detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								detailedWorksheet.getCell("J" + rowPos).value = iterData.content[v].review != "" ? iterData.content[v].review : "N/A";
								rowPos++;
							}
						}
						// For a detailed xlsx export the names on the anime worksheet become hyperlinks to their respective worksheet.
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).value = { hyperlink: "#\'Anime-" + detailedWorksheetName + "\'!A2", text: iterData.name }
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).font.underline = true;
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).font.color = { "argb": "FF0000FF" };
					}
					animeRowCounter++;
				}
				// Generate the worksheet associated to book library records.
				else if(iterData.category == "Book") {
					// Update each row with the relevant book record details on the book worksheet.
					worksheetItemName(bookWorksheet, bookRowCounter, iterData.name);
					bookWorksheet.getCell("B" + (bookRowCounter + 2)).value = iterData.originalName != "" ? iterData.originalName : "N/A";
					bookWorksheet.getCell("C" + (bookRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					bookWorksheet.getCell("C" + (bookRowCounter + 2)).value = iterData.rating != "" ? iterData.rating : "N/A";
					bookWorksheet.getCell("D" + (bookRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					bookWorksheet.getCell("E" + (bookRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					bookWorksheet.getCell("F" + (bookRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					bookWorksheet.getCell("F" + (bookRowCounter + 2)).value = iterData.isbn != "" ? exports.formatISBNString(iterData.isbn) : "N/A";
					bookWorksheet.getCell("G" + (bookRowCounter + 2)).value = iterData.authors != "" ? iterData.authors : "N/A";
					bookWorksheet.getCell("H" + (bookRowCounter + 2)).value = iterData.publisher != "" ? iterData.publisher : "N/A";
					worksheetDateItem(bookWorksheet, "I", bookRowCounter, iterData.publicationDate.split("-"));
					bookWorksheet.getCell("J" + (bookRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					bookWorksheet.getCell("J" + (bookRowCounter + 2)).value = iterData.pages != "" ? iterData.pages : "N/A";
					bookWorksheet.getCell("K" + (bookRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					bookWorksheet.getCell("K" + (bookRowCounter + 2)).value = exports.formatMedia(iterData.media);
					worksheetDateItem(bookWorksheet, "L", bookRowCounter, iterData.read.split("-"));
					genreCellFill(bookWorksheet, iterData.genres, "M", bookRowCounter);
					bookRowCounter++;
				}
				// Generate the worksheet associated to film library records.
				else if(iterData.category == "Film") {
					// Update each row with the relevant film record details on the film worksheet.
					worksheetItemName(filmWorksheet, filmRowCounter, iterData.name);
					filmWorksheet.getCell("B" + (filmRowCounter + 2)).value = iterData.alternateName != "" ? iterData.alternateName : "N/A";
					filmWorksheet.getCell("C" + (filmRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					filmWorksheet.getCell("C" + (filmRowCounter + 2)).value = iterData.rating != "" ? iterData.rating : "N/A";
					filmWorksheet.getCell("D" + (filmRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					filmWorksheet.getCell("E" + (filmRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					filmWorksheet.getCell("F" + (filmRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					filmWorksheet.getCell("F" + (filmRowCounter + 2)).value = iterData.runTime != "" ? exports.formatISBNString(iterData.runTime) : "N/A";
					filmWorksheet.getCell("G" + (filmRowCounter + 2)).value = iterData.directors != "" ? iterData.directors : "N/A";
					filmWorksheet.getCell("H" + (filmRowCounter + 2)).value = iterData.editors != "" ? iterData.editors : "N/A";
					filmWorksheet.getCell("I" + (filmRowCounter + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					filmWorksheet.getCell("J" + (filmRowCounter + 2)).value = iterData.cinematographers != "" ? iterData.cinematographers : "N/A";
					filmWorksheet.getCell("K" + (filmRowCounter + 2)).value = iterData.musicians != "" ? iterData.musicians : "N/A";
					filmWorksheet.getCell("L" + (filmRowCounter + 2)).value = iterData.distributors != "" ? iterData.distributors : "N/A";
					filmWorksheet.getCell("M" + (filmRowCounter + 2)).value = iterData.producers != "" ? iterData.producers : "N/A";
					filmWorksheet.getCell("N" + (filmRowCounter + 2)).value = iterData.productionCompanies != "" ? iterData.productionCompanies : "N/A";
					filmWorksheet.getCell("O" + (filmRowCounter + 2)).value = iterData.stars != "" ? iterData.stars : "N/A";
					worksheetDateItem(filmWorksheet, "P", filmRowCounter, iterData.release.split("-"));
					worksheetDateItem(filmWorksheet, "Q", filmRowCounter, iterData.watched.split("-"));
					genreCellFill(filmWorksheet, iterData.genres, "R", filmRowCounter);
					filmRowCounter++;
				}
				// Generate the worksheet associated to manga library records.
				else if(iterData.category == "Manga") {
					// Update each row with the relevant manga record details on the manga worksheet.
					worksheetItemName(mangaWorksheet, mangaRowCounter, iterData.name);
					mangaWorksheet.getCell("B" + (mangaRowCounter + 2)).value = iterData.jname != "" ? iterData.jname : "N/A";
					mangaWorksheet.getCell("C" + (mangaRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					mangaWorksheet.getCell("C" + (mangaRowCounter + 2)).value = exports.calculateMangaGlobalRating(iterData.content);
					mangaWorksheet.getCell("D" + (mangaRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					mangaWorksheet.getCell("E" + (mangaRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					mangaWorksheet.getCell("F" + (mangaRowCounter + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					mangaWorksheet.getCell("G" + (mangaRowCounter + 2)).value = iterData.illustrators != "" ? iterData.illustrators : "N/A";
					mangaWorksheet.getCell("H" + (mangaRowCounter + 2)).value = iterData.publisher != "" ? iterData.publisher : "N/A";
					mangaWorksheet.getCell("I" + (mangaRowCounter + 2)).value = iterData.jpublisher != "" ? iterData.jpublisher : "N/A";
					mangaWorksheet.getCell("J" + (mangaRowCounter + 2)).value = iterData.demographic != "" ? iterData.demographic : "N/A";
					worksheetDateItem(mangaWorksheet, "K", mangaRowCounter, iterData.start.split("-"));
					mangaWorksheet.getCell("L" + (mangaRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					dateArr = iterData.end.split("-");
					mangaWorksheet.getCell("L" + (mangaRowCounter + 2)).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
					genreCellFill(mangaWorksheet, iterData.genres, "M", mangaRowCounter);
					// If the user desires to export a detailed xlsx file then create a new worksheet for each manga record and populate it with the related content information.
					if(detailed == true) {
						let detailedWorksheetName = iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25),
							recNum = records[x].split("-").slice(-1)[0];
						(detailedWorksheetName + "-" + recNum).length > 25
							? detailedWorksheetName = detailedWorksheetName.substring(0, detailedWorksheetName.length - (recNum.length + 1)) + "-" + recNum
							: detailedWorksheetName = detailedWorksheetName + "-" + recNum;
						// Define the worksheet associated to the manga record.
						let detailedWorksheet = workbook.addWorksheet("Manga-" + detailedWorksheetName);
						detailedWorksheet.views = [{"state": "frozen", "ySplit": 1, "activeCell": "A2"}];
						// Update the style of the first row.
						detailedWorksheet.getRow(1).height = 20;
						detailedWorksheet.getRow(1).alignment = alignmentMidCenParameters;
						detailedWorksheet.getRow(1).border = styleObj;
						detailedWorksheet.getRow(1).font = fontLargeBoldParameters;
						// Construct the column headers.
						detailedWorksheet.columns = [
						  	{ "header": "Type", "width": 20},
						  	{ "header": "Name", "width": 40 },
						  	{ "header": "ASIN/ISBN", "width": 25 },
						  	{ "header": "Release Date", "width": 15 },
						  	{ "header": "Last Read", "width": 15 },
						  	{ "header": "Rating", "width": 10 },
						  	{ "header": "Synopsis", "width": 125 },
						  	{ "header": "Comments/Review", "width": 125 }
						];
						// Keep track of the row position in the worksheet.
						let rowPos = 2;
						// Iterate through the related content of a manga record.
						for(let v = 0; v < iterData.content.length; v++) {
							detailedWorksheet.getRow(rowPos).font = fontSmallParameters;
							detailedWorksheet.getRow(rowPos).alignment = alignmentMidLefWrapParameters;
							detailedWorksheet.getRow(rowPos).height = 75;
							detailedWorksheet.getCell("A" + rowPos).value = iterData.content[v].scenario
							detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
							detailedWorksheet.getCell("C" + rowPos).alignment = alignmentMidCenWrapParameters;
							worksheetDateItem(detailedWorksheet, "D", rowPos - 2, iterData.content[v].release.split("-"));
							worksheetDateItem(detailedWorksheet, "E", rowPos - 2, iterData.content[v].read.split("-"));
							detailedWorksheet.getCell("F" + rowPos).alignment = alignmentMidCenParameters;
							detailedWorksheet.getCell("F" + rowPos).value = iterData.content[v].rating != "" ? iterData.content[v].rating : "N/A";
							detailedWorksheet.getCell("H" + rowPos).value = iterData.content[v].review != "" ? iterData.content[v].review : "N/A";
							// If the related content item corresponds to a chapter listing then update the appropriate columns.
							if(iterData.content[v].scenario == "Chapter") {
								detailedWorksheet.getCell("C" + rowPos).value = "N/A";
								detailedWorksheet.getCell("G" + rowPos).value = "N/A";
							}
							// Otherwise if the related content item corresponds to a volume listing then update the appropriate columns.
							else if(iterData.content[v].scenario == "Volume") {
								detailedWorksheet.getCell("C" + rowPos).alignment = alignmentMidCenWrapParameters;
								detailedWorksheet.getCell("C" + rowPos).value = iterData.content[v].isbn != "" ? exports.formatISBNString(iterData.content[v].isbn) : "N/A";
								detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].synopsis != "" ? iterData.content[v].synopsis : "N/A";
							}
							rowPos++;
						}
						// For a detailed xlsx export the names on the manga worksheet become hyperlinks to their respective worksheet.
						mangaWorksheet.getCell("A" + (mangaRowCounter + 2)).value = { hyperlink: "#\'Manga-" + detailedWorksheetName + "\'!A2", text: iterData.name }
						mangaWorksheet.getCell("A" + (mangaRowCounter + 2)).font.underline = true;
						mangaWorksheet.getCell("A" + (mangaRowCounter + 2)).font.color = { "argb": "FF0000FF" };
					}
					mangaRowCounter++;
				}
				// Generate the worksheet associated to show library records.
				else if(iterData.category == "Show") {
					// Update each row with the relevant show record details on the show worksheet.
					worksheetItemName(showWorksheet, showRowCounter, iterData.name);
					showWorksheet.getCell("B" + (showRowCounter + 2)).value = iterData.alternateName != "" ? iterData.alternateName : "N/A";
					showWorksheet.getCell("C" + (showRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					showWorksheet.getCell("C" + (showRowCounter + 2)).value = exports.calculateShowGlobalRating(iterData.content);
					showWorksheet.getCell("D" + (showRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					showWorksheet.getCell("E" + (showRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					showWorksheet.getCell("F" + (showRowCounter + 2)).alignment = alignmentMidCenWrapParameters;
					showWorksheet.getCell("F" + (showRowCounter + 2)).value = iterData.runTime != "" ? exports.formatISBNString(iterData.runTime) : "N/A";
					showWorksheet.getCell("G" + (showRowCounter + 2)).value = iterData.directors != "" ? iterData.directors : "N/A";
					showWorksheet.getCell("H" + (showRowCounter + 2)).value = iterData.editors != "" ? iterData.editors : "N/A";
					showWorksheet.getCell("I" + (showRowCounter + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					showWorksheet.getCell("J" + (showRowCounter + 2)).value = iterData.cinematographers != "" ? iterData.cinematographers : "N/A";
					showWorksheet.getCell("K" + (showRowCounter + 2)).value = iterData.musicians != "" ? iterData.musicians : "N/A";
					showWorksheet.getCell("L" + (showRowCounter + 2)).value = iterData.distributors != "" ? iterData.distributors : "N/A";
					showWorksheet.getCell("M" + (showRowCounter + 2)).value = iterData.producers != "" ? iterData.producers : "N/A";
					showWorksheet.getCell("N" + (showRowCounter + 2)).value = iterData.productionCompanies != "" ? iterData.productionCompanies : "N/A";
					showWorksheet.getCell("O" + (showRowCounter + 2)).value = iterData.stars != "" ? iterData.stars : "N/A";
					worksheetDateItem(showWorksheet, "P", showRowCounter, iterData.release.split("-"));
					genreCellFill(showWorksheet, iterData.genres, "Q", showRowCounter);
					// If the user desires to export a detailed xlsx file then create a new worksheet for each show record and populate it with the related content information.
					if(detailed == true) {
						let detailedWorksheetName = iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25),
							recNum = records[x].split("-").slice(-1)[0];
						(detailedWorksheetName + "-" + recNum).length > 25
							? detailedWorksheetName = detailedWorksheetName.substring(0, detailedWorksheetName.length - (recNum.length + 1)) + "-" + recNum
							: detailedWorksheetName = detailedWorksheetName + "-" + recNum;
						// Define the worksheet associated to the show record.
						let detailedWorksheet = workbook.addWorksheet("Show-" + detailedWorksheetName);
						detailedWorksheet.views = [{"state": "frozen", "ySplit": 1, "activeCell": "A2"}];
						// Update the style of the first row.
						detailedWorksheet.getRow(1).height = 20;
						detailedWorksheet.getRow(1).alignment = alignmentMidCenParameters;
						detailedWorksheet.getRow(1).border = styleObj;
						detailedWorksheet.getRow(1).font = fontLargeBoldParameters;
						// Construct the column headers.
						detailedWorksheet.columns = [
						  	{ "header": "Season Name", "width": 40 },
						  	{ "header": "Start Date", "width": 15 },
						  	{ "header": "End Date", "width": 15 },
						  	{ "header": "Status", "width": 30 },
						  	{ "header": "Last Watched", "width": 15 },
						  	{ "header": "Rating", "width": 10 },
						  	{ "header": "Episode #", "width": 15 },
						  	{ "header": "Episode Name", "width": 30 },
						  	{ "header": "Comments/Review", "width": 125 }
						];
						// Keep track of the row position in the worksheet.
						let rowPos = 2;
						// Iterate through the related content of a show record.
						for(let v = 0; v < iterData.content.length; v++) {
							for(let t = 0; t < iterData.content[v].episodes.length; t++) {
								detailedWorksheet.getRow(rowPos).font = fontSmallParameters;
								detailedWorksheet.getRow(rowPos).alignment = alignmentMidLefWrapParameters;
								detailedWorksheet.getRow(rowPos).height = 75;
								detailedWorksheet.getCell("A" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								worksheetDateItem(detailedWorksheet, "B", rowPos - 2, iterData.content[v].start.split("-"));
								worksheetDateItem(detailedWorksheet, "C", rowPos - 2, iterData.content[v].end.split("-"));
								detailedWorksheet.getCell("D" + rowPos).value = iterData.content[v].status != "" ? iterData.content[v].status : "N/A";
								worksheetDateItem(detailedWorksheet, "E", rowPos - 2, iterData.content[v].episodes[t].watched.split("-"));
								detailedWorksheet.getCell("F" + rowPos).alignment = alignmentMidCenParameters;
								detailedWorksheet.getCell("F" + rowPos).value = iterData.content[v].episodes[t].rating != "" ? iterData.content[v].episodes[t].rating : "N/A";
								let maxCharCount = String(iterData.content[v].episodes.length).length;
								detailedWorksheet.getCell("G" + rowPos).value = String(t + 1).length < maxCharCount ? new Array(maxCharCount - String(t + 1).length).fill("0").join("") + (t + 1) : t + 1;
								detailedWorksheet.getCell("H" + rowPos).value = iterData.content[v].episodes[t].name != "" ? iterData.content[v].episodes[t].name : "N/A";
								detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].episodes[t].review != "" ? iterData.content[v].episodes[t].review : "N/A";
								rowPos++;
							}
						}
						// For a detailed xlsx export the names on the show worksheet become hyperlinks to their respective worksheet.
						showWorksheet.getCell("A" + (showRowCounter + 2)).value = { hyperlink: "#\'Show-" + detailedWorksheetName + "\'!A2", text: iterData.name }
						showWorksheet.getCell("A" + (showRowCounter + 2)).font.underline = true;
						showWorksheet.getCell("A" + (showRowCounter + 2)).font.color = { "argb": "FF0000FF" };
					}
					showRowCounter++;
				}
			}
			// Write the xlsx file in the desired export location.
			workbook.xlsx.writeFile(path.join(xlsxExportFolder, "Trak-" + (detailed == true ? "Detailed-" : "Simple-") + "XLSX-Export-" + fileDate + ".xlsx")).then(() => {
				log.info("The XLSX export file has been written. To be located at " + path.join(xlsxExportFolder, "Trak-" + (detailed == true ? "Detailed-" : "Simple-") + "XLSX-Export-" + fileDate + ".xlsx"));
				// Copy over all library records which will be included in the export.
				let listPromise = new Promise((resolve, reject) => {
				    records.forEach((elem, index, arr) => {
						fs.copySync(path.join(dataPath, elem, "assets"), path.join(dir, "Trak", "exportTemp", elem, "assets"), { "overwrite": true });
						if(index == arr.length - 1) { resolve(); }
					});
				});
				// Once all necessary records have copied over, zip the assets.
				listPromise.then(() => {
					log.info("All assets have been copied to the exportTemp folder.");
					zipper.zip(path.join(dir, "Trak", "exportTemp"), (prob, zipped) => {
						// If there was an issue creating the zip file notify the user.
						if(prob) {
							log.error("There was an issue in zipping up the library assets. Error Type: " + prob.name + ". Error Message: " + prob.message + ".");
							eve.sender.send("exportXLSXZippingFailure");
						}
						else {
							log.info("The library assets have been successfully zipped up.");
							// Define the zip file name.
							let zipStr = "Trak-XLSX-Export-";
							// Compress the assets zip file if requested.
							if(compressionVal == true) {
								zipStr += "Compressed-";
								zipped.compress();
							}
							zipStr += fileDate + ".zip";
							// Save the assets zip file, empty the exportTemp folder, and notify the user that the export process has finished.
							zipped.save(path.join(xlsxExportFolder, zipStr), zipErr => {
								if(zipErr) {
									log.error("There was an issue in creating the zip file for the library records assets export. Error Type: " + zipErr.name + ". Error Message: " + zipErr.message + ".");
									eve.sender.send("exportXLSXFileFailure");
								}
								else {
									log.info("Emptying the exportTemp folder.");
									fs.emptyDirSync(exportTempFolder);
									log.info("The library records have been exported to " + exportLocation + ".");
									eve.sender.send("exportSuccess", exportLocation);
									log.info("The XLSX export process has ended.");
								}
							});
						}
					});
				}).catch(copyErr => log.error("There was an issue in resolving the promise associated to the copying of all records which are to be exported. Error Type: " + copyErr.name + ". Error Message: " + copyErr.message + "."));
			}).catch(xlsxErr => log.error("There was an issue in writing the xlsx file " + path.join(xlsxExportFolder, "Trak-" + (detailed == true ? "Detailed-" : "Simple-") + "XLSX-Export-" + fileDate + ".xlsx") + ". Error Type: " + xlsxErr.name + ". Error Message: " + xlsxErr.message + "."));
		}
	});
};



/*

Create a zip file containing the exported library records.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- zipper is a library object which can create zip files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- exportLocation is a string representing the location where the generated zip file will be placed.
	- records is the list of items which the user desires to export.
	- compressionVal is a boolean representing whether the zip file should be compressed.

*/ 
exports.exportDataZIP = (fs, path, log, zipper, eve, dir, exportLocation, records, compressionVal = false) => {
	log.info("The ZIP export process has started.");
	// If the exportTemp folder does not exist, then create it.
	const exportTempFolder = path.join(dir, "Trak", "exportTemp");
	if(!fs.existsSync(exportTempFolder)) {
		log.info("Creating the exportTemp folder. To be located at " + exportTempFolder);
		fs.mkdirSync(exportTempFolder);
	}
	// Otherwise empty it.
	else {
		log.info("Emptying the exportTemp folder.");
		fs.emptyDirSync(exportTempFolder);
	}
	const fileDateArr = (new Date().toJSON().slice(0, 10)).split("-"),
		fileDate = fileDateArr[1] + "." + fileDateArr[2] + "." + fileDateArr[0];
	// Read the settings configuration file.
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
		// If there was an issue reading the settings configuration file notify the user.
		if(err) {
			log.error("There was an issue in reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
			eve.sender.send("configurationFileOpeningFailure");
		}
		else {
			log.info("The settings configuration file has been successfully read.");
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
				log.info("All library records which the user desires to export have been copied to the exportTemp folder.");
				zipper.zip(exportTempFolder, (prob, zipped) => {
					// If there was an issue creating the zip file notify the user.
					if(prob) {
						log.error("There was an issue in zipping up the library assets. Error Type: " + prob.name + ". Error Message: " + prob.message + ".");
						eve.sender.send("exportZIPZippingFailure");
					}
					else {
						log.info("The library assets have been successfully zipped up.");
						// Define the zip file name.
						let zipStr = "Trak-ZIP-Export-";
						// Compress the zip file if requested.
						if(compressionVal == true) {
							zipStr += "Compressed-";
							zipped.compress();
						}
						zipStr += fileDate + ".zip";
						// Delete a previous export if it exists for the current day.
						let deletePromise = new Promise((resolve, reject) => {
							if(fs.existsSync(path.join(exportLocation, zipStr))) {
								fs.unlink(path.join(exportLocation, zipStr), delErr => {
									if(delErr) {
										log.error("There was an issue in deleting the zip file associated to a previous export today. Error Type: " + delErr.name + ". Error Message: " + delErr.message + ".");
										eve.sender.send("exportZIPFileDeleteFailure");
									}
									else {
										log.info("The zip file associated to a previous export today has been successfully deleted.");
										resolve();
									}
								});
							}
							else { resolve(); }
						});
						// Save the zip file, empty the exportTemp folder, and notify the user that the export process has finished.
						deletePromise.then(() => {
							zipped.save(path.join(exportLocation, zipStr), zipErr => {
								if(zipErr) {
									log.error("There was an issue in creating the zip file for the library records assets export. Error Type: " + zipErr.name + ". Error Message: " + zipErr.message + ".");
									eve.sender.send("exportZIPFileFailure");
								}
								else {
									log.info("Emptying the exportTemp folder.");
									fs.emptyDirSync(exportTempFolder);
									log.info("The library records have been exported to " + exportLocation + ".");
									eve.sender.send("exportSuccess", exportLocation);
									log.info("The ZIP export process has ended.");
								}
							});
						}).catch(promiseErr => log.error("There was an issue in resolving the promise associated to the deletion of a zip file in a previous export. Error Type: " + promiseErr.name + ". Error Message: " + promiseErr.message + "."));
					}
				});
			}).catch(promiseCopyErr => log.error("There was an issue in resolving the promise associated to the copying of all records which are to be exported. Error Type: " + promiseCopyErr.name + ". Error Message: " + promiseCopyErr.message + "."));
		}
	});
};



/*

Finishes the application import process by copying new records into the library.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- aTool, bTool, and mTool provide the means to obtain record details from online sources.
	- appWin is an object referencing the primary window of the Electron app.
	- winEvent is the object which allows for interaction with the fron-end of the Electron application.
	- promiseResolver is the resolver callback for the file import promise.
	- configFir is a string representing the base directory corresponding to the location of the configuration file.
	- dataDir is the directory where the user library records are stored.
	- impFile is the zip file to be imported.
	- mode is a string corresponding to which import process is being utilized.

*/ 
exports.importCompare = (fs, path, log, ipc, aTool, bTool, mTool, appWin, winEvent, promiseResolver, configDir, dataDir, impFile, mode) => {
	// Send a request to the front-end to ask the user if they want to fetch details from online sources for the records being imported.
	winEvent.sender.send("importFetchAsk");
	// Proceed if the import process has not been abandoned by the user.
	ipc.on("importFetchConfirm", (fetchEvent, fetchCheck) => {
		// Define the list of records being imported, currently located in the importTemp folder.
		let list = fs.readdirSync(path.join(configDir, "Trak", "importTemp")).filter(file => fs.statSync(path.join(path.join(configDir, "Trak", "importTemp"), file)).isDirectory());
		if(list.length > 0) {
			// Proceed with the following only if the user has chosen not to fetch details from online sources for the records being imported.
			if(fetchCheck == false) {
				// Proceed only if there are records being imported.
				if(list.length > 0) {
					// Copy the records.
					log.info("The " + mode + " import process is copying over records into the library.");
					list.forEach(elem => {
						if(fs.existsSync(path.join(configDir, "Trak", "importTemp", elem, "data.json"))) {
							fs.moveSync(path.join(configDir, "Trak", "importTemp", elem), path.join(dataDir, elem));
						}
					});
					// Empty the importTemp folder.
					log.info("Emptying the importTemp folder.");
					fs.emptyDirSync(path.join(configDir, "Trak", "importTemp"));
					// Reload the primary window.
					appWin.reload();
					setTimeout(() => {
						// Formally finish the import process.
						promiseResolver();
						appWin.webContents.send("importFileSuccess", impFile);
						log.info("The " + mode + " import process has ended.");
					}, 1000);
				}
			}
			else {
				// Define the collection of promises associated to fetching record details.
				const fetchPromises = [];
				// Iterate through all records being imported.
				for(let p = 0; p < list.length; p++) {
					if(fs.existsSync(path.join(configDir, "Trak", "importTemp", list[p], "data.json"))) {
						// Define the promise associated to the current record which fetches record details.
						let curPromise = new Promise((curRes, curRej) => {
							// Read the data file associated to the current record being imported.
							fs.readFile(path.join(configDir, "Trak", "importTemp", list[p], "data.json"), "UTF8", (readImportErr, curImportData) => {
								// If there was an issue reading the data file associated to the current record notify the user.
								if(readImportErr) {
									log.error("There was an issue in reading the data file associated to the record being imported, " + list[p].split("-")[0].toLowerCase() + " " + list[p].split("-").splice(-1).join("-").toLowerCase() + ".");
									winEvent.sender.send("importReadFailure", list[p]);
								}
								// If no error popped up continue with the fetching process.
								else {
									// Define the current record data.
									let curImport = JSON.parse(curImportData);
									// Proceed if the current record corresponds to an anime record.
									if(curImport.category == "Anime") {
										// Fetch the anime details.
									    aTool.getInfoFromName(curImport.name, true, "anime").then(animeData => {
									        // Define the parameters which need to be processed properly.
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
									            if(splitArr.length > 1) { endDate = splitArr[1]; }
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
									        // Modify the record japanese name.
									        curImport.jname = animeData.japaneseTitle;
									        // Modify the record synopsis.
									        let synText = animeData.synopsis.replace("[Written by MAL Rewrite]", "");
									        if(synText.includes("(Source:")) {
									            synText = synText.substring(0, synText.indexOf("(Source:"));
									        }
									        synText = synText.trim();
									        curImport.synopsis != "" ? curImport.synopsis += "\n" + synText : curImport.synopsis = synText;
									        // Modify the record directors.
									        if(directorsArr.length > 0) {
									        	curImport.directors != "" ? curImport.directors += ", " + directorsArr.join(", ") : curImport.directors = directorsArr.join(", ");
									        }
									        // Modify the record producers.
									        if(producersArr.length > 0) {
									        	curImport.producers != "" ? curImport.producers += ", " + animeData.producers.concat(producersArr).join(", ") : curImport.producers = animeData.producers.concat(producersArr).join(", ");
									        }
									        // Modify the record writers.
									        if(writersArr.length > 0) {
									        	curImport.writers != "" ? curImport.writers += ", " + writersArr.join(", ") : curImport.writers = writersArr.join(", ");
									        }
									        // Modify the record musicians.
									        if(musicArr.length > 0) {
									        	curImport.musicians != "" ? curImport.musicians += ", " + musicArr.join(", ") : curImport.musicians = musicArr.join(", ");
									        }
									        // Modify the record studio.
									        if(animeData.studios.length > 0) {
									        	curImport.studio != "" ? curImport.studio += ", " + animeData.studios.join(", ") : curImport.studio = animeData.studios.join(", ");
									        }
									        // Modify the record season and year.
									        let curSeason = animeData.premiered.split(" ");
									        curImport.season = curSeason[0].toLowerCase();
									        curImport.year = curSeason[1];
									        // Modify the record genres.
									        for(let s = 0; s < animeData.genres.length; s++) {
										        let r = 0;
										        for(; r < curImport.genres[0].length; r++) {
										        	if(animeData.genres[s] == curImport.genres[0][r]) {
										        		curImport.genres[1][r] = true;
										        		break;
										        	}
										        }
										        if(r == curImport.genres[0].length && curImport.genres[2].indexOf(animeData.genres[s]) == -1) {
										        	curImport.genres[2].push(animeData.genres[s]);
										        	curImport.genres[2].sort();
										        }
									        }
									        // Modify the record related content accordingly.
									        if(animeData.type != "TV") {
									        	if(curImport.content.length == 0) {
										            curImport.content.push({
										                "scenario": "Single",
										                "name": "Fetched Data",
										                "type": animeData.type,
										                "release": new Date(startDate.trim()).toISOString().split("T")[0],
										                "watched": "",
										                "rating": "",
										                "review": ""
										            });
									        	}
									        	else {
									        		curImport.content[0].name = "Fetched Data";
									        		curImport.content[0].type = animeData.type;
									        		curImport.content[0].release = new Date(startDate.trim()).toISOString().split("T")[0];
									        	}
									        }
									        else {
									        	let curRecordSeasonObj = {
									                "scenario": "Season",
									                "name": "Fetched Data",
									                "start": new Date(startDate.trim()).toISOString().split("T")[0],
									                "end": new Date(endDate.trim()).toISOString().split("T")[0],
									                "status": "",
									                "episodes": []
									            };
									            for(let n = 0; n < parseInt(animeData.episodes); n++) {
									                curRecordSeasonObj.episodes.push({
									                    "name": "Episode " + (n + 1),
									                    "watched": "",
									                    "rating": "",
									                    "review": ""
									                });
									            }
									            curImport.content.push(curRecordSeasonObj);
									        }
									        // Fetch all possible images associated to the anime record.
									        aTool.getPictures(animeData.title).then(malImgArr => {
									        	// Define the collection of image links.
									            log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + curImport.name + ".");
									            let allImgArr = malImgArr.map(pic => pic.imageLink);
									            allImgArr.indexOf(animeData.picture) != -1 ? exports.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0) : allImgArr = [animeData.picture].concat(allImgArr);
									        	// Modify the record images.
									        	curImport.img = curImport.img.concat(exports.objCreationImgs(path, fs, require("https"), configDir, list[p], [false, allImgArr]));
									        	if(curImport.img.length > 1) { curImport.img = curImport.img.filter(elem => elem != ""); }
									        	// Write the data file associated the current record.
									        	fs.writeFile(path.join(configDir, "Trak", "importTemp", list[p], "data.json"), JSON.stringify(curImport), "UTF8", fetchWriteErr => {
									        		// If there was an issue writing the data file associated to the current record notify the user.
									        		if(fetchWriteErr) {
									        			log.error("There was an issue in writing the data file associated to the record being imported, " + curImport.category.toLowerCase() + " " + curImport.name);
									        			winEvent.sender.send("importWriteFailure", list[p]);
									        			curRej();
									        		}
									        		else { curRes(); }
									        	});
									        }).catch(err => {
									        	// If there was an issue fetching all anime images then simply provide only the default one.
									            log.error("There was an issue in obtaining the pictures associated to the anime record " + curImport.name + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
									            // Modify the record images.
									            curImport.img = curImport.img.concat(exports.objCreationImgs(path, fs, require("https"), configDir, list[p], [false, [animeData.picture]]));
									            if(curImport.img.length > 1) { curImport.img = curImport.img.filter(elem => elem != ""); }
									            // Write the data file associated the current record.
									            fs.writeFile(path.join(configDir, "Trak", "importTemp", list[p], "data.json"), JSON.stringify(curImport), "UTF8", fetchWriteErr => {
									        		// If there was an issue writing the data file associated to the current record notify the user.
									        		if(fetchWriteErr) {
									        			log.error("There was an issue in writing the data file associated to the record being imported, " + curImport.category.toLowerCase() + " " + curImport.name);
									        			winEvent.sender.send("importWriteFailure", list[p]);
									        			curRej();
									        		}
									        		else { curRes(); }
									        	});
									        });
									    }).catch(err => {
									    	// If there was an issue in obtaining the details associated to the current record notify the user.
									    	log.error("There was an issue in obtaining the details associated to the anime name " + curImport.name + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
									    	winEvent.sender.send("importFetchFailure", list[p]);
									    	curRej();
									    });
									}
									// Proceed if the current record corresponds to a book record.
									else if(curImport.category == "Book") {
										// Fetch the book details.
										bTool.searchBooks({ "q": curImport.name }).then(bookSearchData => {
									        // Fetch book details based on the best name match.
									        bTool.getBook({ "url": bookSearchData.books[0].url }).then(bookData => {
									            log.info("GoodReads-Scraper has finished getting the details for the name " + curImport.name + ".");
									            // Modify the book original name.
									            curImport.originalName != "" ? curImport.originalName += ", " + bookData.originalTitle : curImport.originalName = bookData.originalTitle;
									            // Modify the book asin/isbn value.
									            curImport.isbn = (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin);
									            // Modify the book media type.
									            curImport.media = bookData.media;
									            // Modify the book authors.
									            curImport.authors != "" ? curImport.authors += ", " + bookData.authors.join(", ") : curImport.authors = bookData.authors.join(", ");
									            // Modify the book publisher.
									            curImport.publisher != "" ? curImport.publisher += ", " + bookData.publisher : curImport.publisher = bookData.publisher;
									            // Modify the book publication date.
									            curImport.publicationDate = new Date(bookData.publicationDate).toISOString().split("T")[0];
									            // Modify the number of pages associated to the book.
									            curImport.pages = String(bookData.pages);
									            // Modify the record synopsis.
										        let synText = bookData.description.trim();
										        curImport.synopsis != "" ? curImport.synopsis += "\n" + synText : curImport.synopsis = synText;
									            // Modify the record genres.
										        for(let s = 0; s < bookData.genres.length; s++) {
											        let r = 0;
											        for(; r < curImport.genres[0].length; r++) {
											        	if(bookData.genres[s] == curImport.genres[0][r]) {
											        		curImport.genres[1][r] = true;
											        		break;
											        	}
											        }
											        if(r == curImport.genres[0].length && curImport.genres[2].indexOf(bookData.genres[s]) == -1) {
											        	curImport.genres[2].push(bookData.genres[s]);
											        	curImport.genres[2].sort();
											        }
										        }
									        	// Modify the record images.
									        	curImport.img = curImport.img.concat(exports.objCreationImgs(path, fs, require("https"), configDir, list[p], [false, [bookData.coverLarge]]));
									        	if(curImport.img.length > 1) { curImport.img = curImport.img.filter(elem => elem != ""); }
									        	// Write the data file associated the current record.
									            fs.writeFile(path.join(configDir, "Trak", "importTemp", list[p], "data.json"), JSON.stringify(curImport), "UTF8", fetchWriteErr => {
									        		// If there was an issue writing the data file associated to the current record notify the user.
									        		if(fetchWriteErr) {
									        			log.error("There was an issue in writing the data file associated to the record being imported, " + curImport.category.toLowerCase() + " " + curImport.name);
									        			winEvent.sender.send("importWriteFailure", list[p]);
									        			curRej();
									        		}
									        		else { curRes(); }
									        	});
									        }).catch(err => log.error("There was an issue in obtaining the details associated to the book title " + curImport.name + " via the url " + bookLstItem.url + ". Error Type: " + err.name + ". Error Message: " + err.message + "."));
									    }).catch(err => log.error("There was an issue in obtaining the details associated to the book title " + curImport.name + ". Error Type: " + err.name + ". Error Message: " + err.message + "."));
									}
								}
							});
						});
						fetchPromises.push(curPromise);
					}
				}
				Promise.all(fetchPromises).then(() => {
					// Proceed only if there are records being imported.
					if(list.length > 0) {
						// Copy the records.
						log.info("The " + mode + " import process is copying over records into the library.");
						list.forEach(elem => {
							if(fs.existsSync(path.join(configDir, "Trak", "importTemp", elem, "data.json"))) {
								fs.moveSync(path.join(configDir, "Trak", "importTemp", elem), path.join(dataDir, elem));
							}
						});
						// Empty the importTemp folder.
						log.info("Emptying the importTemp folder.");
						fs.emptyDirSync(path.join(configDir, "Trak", "importTemp"));
						// Reload the primary window.
						appWin.reload();
						setTimeout(() => {
							// Formally finish the import process.
							promiseResolver();
							appWin.webContents.send("importFileSuccess", impFile);
							log.info("The " + mode + " import process has ended.");
						}, 1000);
					}
				});
			}
		}
		else {
			// Formally finish the import process.
			promiseResolver();
			appWin.webContents.send("importFileSuccess", impFile);
			log.info("The " + mode + " import process has ended.");
		}
	});
	// Proceed if the import process has been abandoned by the user.
	ipc.on("importFetchDenial", denEvent => {
		// Empty the importTemp folder.
		log.info("Aborting the import process. Emptying the importTemp folder.");
		fs.emptyDirSync(path.join(configDir, "Trak", "importTemp"));
		setTimeout(() => {
			// Formally finish the import process.
			promiseResolver();
			log.info("The " + mode + " import process has ended.");
		}, 1000);
	});
};



/*

Reads a xlsx file and adds its content to the library records.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- aniTool, bookTool, and movTool provide the means to obtain record details from online sources.
	- zipper is a library object which can create zip files.
	- ExcelJS provides the means to export/import xlsx files.
	- win is an object referencing the primary window of the Electron app.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- xlsxFile is the xlsx file to be imported.
	- full is a boolean representing whether the xlsx file should contain only basic details or everything.

*/ 
exports.importDataXLSX = async (fs, path, log, ipc, aniTool, bookTool, movTool, zipper, ExcelJS, win, eve, dir, xlsxFile, full) => {
	log.info("The XLSX import process has started.");
	// Define the file extensions which will correspond to an image.
	const imgExtArr = [".jpg", ".jpeg", ".png"];
	// Define an array to act as a holder in reformatting dates.
	let relDateArr = [];
	return new Promise((res, rej) => {
		// If the exportTemp folder does not exist, then create it.
		const importTempFolder = path.join(dir, "Trak", "importTemp");
		if(!fs.existsSync(importTempFolder)) {
			log.info("Creating the importTemp folder. To be located at " + importTempFolder);
			fs.mkdirSync(importTempFolder);
		}
		// Otherwise empty the directory just in case.
		else {
			log.info("Emptying the importTemp folder.");
			fs.emptyDirSync(importTempFolder);
		}
		// Read the settings configuration file.
		fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
			// If there was an issue reading the settings configuration file notify the user.
			if(err) {
				log.error("There was an issue in reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
				eve.sender.send("configurationFileOpeningFailure");
			}
			else {
				log.info("The settings configuration file has been successfully read.");
				// Define the configuration file data, associated library records path, and a workbook which will be written to in order to produce a xlsx file.
				const fileData = JSON.parse(fileContent).current != undefined ? JSON.parse(fileContent).current.path : JSON.parse(fileContent).original.path,
					workbook = new ExcelJS.Workbook();
				// Unzip the assets zip file if it exists and copy the content over to the temporary import folder.
				let zipXLSXFile = path.basename(xlsxFile).split("-");
				zipXLSXFile.splice(1, 1);
				if(fs.existsSync(path.join(path.dirname(xlsxFile), zipXLSXFile.join("-").replace(".xlsx", ".zip")))) {
					log.info("The assets in the zip file associated to the XLSX import have been unzipped into the importTemp folder.");
					zipper.sync.unzip(path.join(path.dirname(xlsxFile), zipXLSXFile.join("-").replace(".xlsx", ".zip"))).save(importTempFolder);
				}
				// Read the xlsx file the user wants to import.
				workbook.xlsx.readFile(xlsxFile).then(wb => {
					log.info("The XLSX file " + xlsxFile + " has been successfully read.");
					const workbookPromise = new Promise((resolve, reject) => {
						// Iterate through all workbook worksheets.
						wb.worksheets.forEach(elem => {
							// Handle the import of anime records.
							if(elem.name == "Category-Anime") {
								log.info("Importing the anime records.");
								// Get the list of anime genres.
								let genreLst = exports.genreList("Anime");
								// Iterate through all the rows of the anime worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to an anime record.
									let jnameHolder = elem.getCell("B" + q).value,
										reviewHolder = elem.getCell("D" + q).value,
										directorsHolder = elem.getCell("F" + q).value,
										producersHolder = elem.getCell("G" + q).value,
										writersHolder = elem.getCell("H" + q).value,
										musiciansHolder = elem.getCell("I" + q).value,
										studioHolder = elem.getCell("J" + q).value,
										licenseHolder = elem.getCell("K" + q).value,
										seasonHolder = elem.getCell("M" + q).value,
										synopsisHolder = elem.getCell("E" + q).value;
									let animeObj = {
										"category": "Anime",
										"name": ((typeof elem.getCell("A" + q).value === "object" && elem.getCell("A" + q).value !== null) ? elem.getCell("A" + q).value.text : elem.getCell("A" + q).value),
										"jname": (jnameHolder != null && jnameHolder != "N/A" ? jnameHolder : ""),
										"review": (reviewHolder != null && reviewHolder != "N/A" ? reviewHolder : ""),
										"directors": (directorsHolder != null && directorsHolder != "N/A" ? directorsHolder : ""),
										"producers": (producersHolder != null && producersHolder != "N/A" ? producersHolder : ""),
										"writers": (writersHolder != null && writersHolder != "N/A" ? writersHolder : ""),
										"musicians": (musiciansHolder != null && musiciansHolder != "N/A" ? musiciansHolder : ""),
										"studio": (studioHolder != null && studioHolder != "N/A" ? studioHolder : ""),
										"license": (licenseHolder != null && licenseHolder != "N/A" ? licenseHolder : ""),
										"season": (seasonHolder != null && seasonHolder != "N/A" ? seasonHolder.split(" ")[0].toLowerCase() : ""),
										"year": (seasonHolder != null && seasonHolder != "N/A" ? seasonHolder.split(" ")[1] : ""),
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"synopsis": synopsisHolder != null && synopsisHolder != "N/A" ? synopsisHolder : "",
										"img": [],
										"content": []
									};
									// Update the genres of the anime record object.
									let genresHolder = elem.getCell("N" + q).value,
										genresCellList = ((genresHolder != null && genresHolder != "" && genresHolder != "N/A") ? genresHolder.split(",").map(elem => elem.trim()) : []);
									for(let p = 0; p < genresCellList.length; p++) {
										let compare = genresCellList[p];
										if(compare == "Coming-of-Age") { compare = "ComingOfAge"; }
										else if(compare == "Post-Apocalyptic") { compare = "PostApocalyptic"; }
										else if(compare == "Sci-Fi") { compare = "SciFi"; }
										else if(compare == "Slice of Life") { compare = "SliceOfLife"; }
										let genreIndex = genreLst.indexOf(compare);
										if(genreIndex == -1) { animeObj.genres[2].push(compare); }
										else { animeObj.genres[1][genreIndex] = true; }
									}
									// If the user requests a detailed import then update the related content of the anime record object.
									if(full == true) {
										// Iterate through all workbook worksheets.
										wb.worksheets.forEach(newElem => {
											// Detect the anime record detailed worksheet by its name.
											if(newElem.name == "Anime-" + animeObj.name.split(" ").map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25)) {
												animeObj.content = [];
												// Iterate through the detailed worksheet's rows.
												for(let l = 2; l < newElem.rowCount + 1; l++) {
													// If the detailed worksheet has a season entry then iterate through all corresponding rows and add the season as an object to the related content array.
													if(newElem.getCell("A" + l).value == "Season") {
														let seasonContentObj = {
															"scenario": "Season",
															"name": newElem.getCell("B" + l).value != "N/A" ? newElem.getCell("B" + l).value : "",
															"start": "",
															"end": "",
															"status": newElem.getCell("E" + l).value != "N/A" ? newElem.getCell("E" + l).value : "",
															"episodes": []
														};
														if(newElem.getCell("C" + l).value != "" && newElem.getCell("C" + l).value != "N/A") {
															relDateArr = newElem.getCell("C" + l).value.split("-");
															seasonContentObj.start = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
														}
														if(newElem.getCell("D" + l).value != "" && newElem.getCell("D" + l).value != "N/A") {
															relDateArr = newElem.getCell("D" + l).value.split("-");
															seasonContentObj.end = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
														}
														while(newElem.getCell("B" + l).value == seasonContentObj.name) {
															let episodeContentObj = {
																"name": newElem.getCell("I" + l).value != "N/A" ? newElem.getCell("I" + l).value : "",
																"watched": "",
																"rating": newElem.getCell("G" + l).value != "N/A" ? parseInt(newElem.getCell("G" + l).value) : "",
																"review": newElem.getCell("J" + l).value != "N/A" ? newElem.getCell("J" + l).value : ""
															};
															if(newElem.getCell("F" + l).value != "" && newElem.getCell("F" + l).value != "N/A") {
																relDateArr = newElem.getCell("F" + l).value.split("-");
																episodeContentObj.watched = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
															}
															seasonContentObj.episodes.push(episodeContentObj);
															l++;
														}
														animeObj.content.push(seasonContentObj);
													}
													// Otherwise if the detailed worksheet has a single entry then add the row information to a single object and add to the related content array.
													else {
														let singleContentObj = {
															"scenario": "Single",
															"name": newElem.getCell("B" + l).value != "N/A" ? newElem.getCell("B" + l).value : "",
															"type": newElem.getCell("A" + l).value != "N/A" ? newElem.getCell("A" + l).value : "",
															"release": "",
															"watched": "",
															"rating": newElem.getCell("G" + l).value != "N/A" ? parseInt(newElem.getCell("G" + l).value) : "",
															"review": newElem.getCell("J" + l).value != "N/A" ? newElem.getCell("J" + l).value : ""
														};
														if(newElem.getCell("C" + l).value != "" && newElem.getCell("C" + l).value != "N/A") {
															relDateArr = newElem.getCell("C" + l).value.split("-");
															singleContentObj.release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
														}
														if(newElem.getCell("F" + l).value != "" && newElem.getCell("F" + l).value != "N/A") {
															relDateArr = newElem.getCell("F" + l).value.split("-");
															singleContentObj.watched = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
														}
														animeObj.content.push(singleContentObj);
													}
												}
											}
										});
									}
									else {
										let ratingPlaceholder = elem.getCell("C" + q).value;
										animeObj.content.push({
											"scenario": "Single",
											"name": "Imported Data",
											"type": "",
											"release": "",
											"watched": "",
											"rating": (ratingPlaceholder != null && ratingPlaceholder != "N/A" && ratingPlaceholder != "" ? elem.getCell("C" + q).value : ""),
											"review": ""
										});
										// Update the release date of the anime record object.
										let releaseHolder = elem.getCell("L" + q).value;
										if(releaseHolder != null && releaseHolder != "" && releaseHolder != "N/A") {
											relDateArr = elem.getCell("L" + q).value.split("-");
											animeObj.content[0].release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
										}
									}
									let fldrName = exports.formatFolderName(animeObj.name),
										fldrNum = (fs.readdirSync(path.join(dir, "Trak", "data")).filter(file => fs.statSync(path.join(dir, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-").includes(fldrName)).length);
									// Create the assets folder.
									log.info("Creating the record assets folder associated to the anime " + (animeObj.name != "" ? animeObj.name : animeObj.jname));
									fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Anime-" + fldrName + "-" + fldrNum, "assets"), { "recursive": true });
									// Check the assets that were imported from the associated zip file and add the images to the anime record object.
									for(let q = 0; q <= fldrNum; q++) {
										let assetsFolder = path.join(dir, "Trak", "importTemp", "Anime-" + fldrName + "-" + q, "assets");
										if(fs.existsSync(assetsFolder)) {
											log.info("Copying over the record assets for " + animeObj.name + ".");
											fs.readdirSync(assetsFolder).forEach(asset => {
												if(imgExtArr.includes(path.extname(asset))) {
													animeObj.img.push(path.join(fileData, "Anime-" + fldrName + "-" + q, "assets", asset));
												}
											});
										}
									}
									if(animeObj.img.length == 0) { animeObj.img.push(""); }
									// Write data.json file associated to the anime record.
									log.info("Writing the data file associated to the anime " + animeObj.name);
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Anime-" + fldrName + "-" + fldrNum, "data.json"), JSON.stringify(animeObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
							// Handle the import of book records.
							else if(elem.name == "Category-Book") {
								log.info("Importing the book records.");
								// Get the list of book genres.
								let genreLst = exports.genreList("Book");
								// Iterate through all the rows of the book worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									let isbnVal = String(elem.getCell("F" + q).value),
										isbnCheck = (isbnVal != "N/A" && isbnVal != "") ? isbnVal.replace(/\W/g, "") : isbnVal;
									if(isbnCheck.length == 13 || isbnVal.length == 10) {
										// Define the object which will correspond to a book record.
										let bookObj = {
											"category": "Book",
											"name": elem.getCell("A" + q).value,
											"originalName": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
											"rating": elem.getCell("C" + q).value != "N/A" && elem.getCell("C" + q).value != "" ? parseInt(elem.getCell("C" + q).value) : "",
											"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "",
											"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "",
											"isbn": elem.getCell("F" + q).value != "N/A" && elem.getCell("F" + q).value != "" ? String(elem.getCell("F" + q).value).replace(/-/g, "") : "",
											"authors": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "",
											"publisher": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "",
											"publicationDate": "",
											"pages": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "",
											"media": elem.getCell("K" + q).value != "N/A" ? elem.getCell("K" + q).value : "",
											"read": "",
											"genres": [genreLst, new Array(genreLst.length).fill(false), []],
											"img": []
										};
										// Update the publication date of the book record object.
										let pub = elem.getCell("I" + q).value;
										if(pub != null && pub != "" && pub != "N/A") {
											relDateArr = elem.getCell("I" + q).value.split("-");
											bookObj.publicationDate = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
										}
										// Update the last read date of the book record object.
										let re = elem.getCell("L" + q).value;
										if(re != null && re != "" && re != "N/A") {
											relDateArr = elem.getCell("L" + q).value.split("-");
											bookObj.read = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
										}
										// Update the genres of the anime record object.
										let genresHolder = elem.getCell("M" + q).value;
										let	genresCellList = ((genresHolder != null && genresHolder != "" && genresHolder != "N/A") ? genresHolder.split(",").map(elem => elem.trim()) : []);
										for(let p = 0; p < genresCellList.length; p++) {
											let compare = genresCellList[p];
											if(compare == "Sci-Fi") {
												compare = "SciFi";
											}
											let genreIndex = genreLst.indexOf(compare);
											if(genreIndex == -1) {
												bookObj.genres[2].push(compare);
											}
											else {
												bookObj.genres[1][genreIndex] = true;
											}
										}
										let fldrName = exports.formatFolderName(bookObj.name) + "-" + bookObj.isbn;
										// Check the assets that were imported from the associated zip file and add the images to the book record object.
										let assetsFolder = path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "assets");
											log.info("Creating the record assets folder associated to the book " + (bookObj.name != "" ? bookObj.name : bookObj.isbn));
											fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "assets"), { "recursive": true });
										if(fs.existsSync(assetsFolder)) {
											log.info("Copying over the record assets for " + (bookObj.name != "" ? bookObj.name : bookObj.isbn) + ".");
											fs.readdirSync(assetsFolder).forEach(asset => {
												if(imgExtArr.includes(path.extname(asset))) {
													bookObj.img.push(path.join(fileData, "Book-" + fldrName, "assets", asset));
												}
											});
										}
										if(bookObj.img.length == 0) { bookObj.img.push(""); }
										// Otherwise if no assets were found then create the assets folder.
										else {
										}
										// Write data.json file associated to the book record.
										log.info("Writing the data file associated to the book " + (bookObj.name != "" ? bookObj.name : bookObj.isbn));
										fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "data.json"), JSON.stringify(bookObj), "UTF8");
										if(q == elem.rowCount) { resolve(); }
									}
									else {
										log.warn("The record associated to the book " + elem.getCell("A" + q).value + " cannot be imported without an associated ASIN/ISBN.");
									}
								}
							}
							// Handle the import of film records.
							else if(elem.name == "Category-Film") {
								log.info("Importing the film records.");
								// Get the list of film genres.
								let genreLst = exports.genreList("Film");
								// Iterate through all the rows of the film worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to a film record.
									let filmObj = {
										"category": "Film",
										"name": elem.getCell("A" + q).value,
										"alternateName": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
										"rating": elem.getCell("C" + q).value != "N/A" && elem.getCell("C" + q).value != "" ? parseInt(elem.getCell("C" + q).value) : "",
										"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "",
										"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "",
										"runTime": elem.getCell("F" + q).value != "N/A" ? String(parseInt(elem.getCell("F" + q).value)) : "",
										"directors": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "",
										"editors": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "",
										"writers": elem.getCell("I" + q).value != "N/A" ? elem.getCell("I" + q).value : "",
										"cinematographers": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "",
										"musicians": elem.getCell("K" + q).value != "N/A" ? elem.getCell("K" + q).value : "",
										"distributors": elem.getCell("L" + q).value != "N/A" ? elem.getCell("L" + q).value : "",
										"producers": elem.getCell("M" + q).value != "N/A" ? elem.getCell("M" + q).value : "",
										"productionCompanies": elem.getCell("N" + q).value != "N/A" ? elem.getCell("N" + q).value : "",
										"stars": elem.getCell("O" + q).value != "N/A" ? elem.getCell("O" + q).value : "",
										"release": "",
										"watched": "",
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"img": []
									};
									// Update the release date of the film record object.
									if(elem.getCell("P" + q).value != "" && elem.getCell("P" + q).value != "N/A") {
										relDateArr = elem.getCell("P" + q).value.split("-");
										filmObj.release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the last watched date of the film record object.
									if(elem.getCell("Q" + q).value != "" && elem.getCell("Q" + q).value != "N/A") {
										relDateArr = elem.getCell("Q" + q).value.split("-");
										filmObj.watched = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the genres of the film record object.
									let genresHolder = elem.getCell("R" + q).value,
										genresCellList = ((genresHolder != null && genresHolder != "" && genresHolder != "N/A") ? genresHolder.split(",").map(elem => elem.trim()) : []);
									for(let p = 0; p < genresCellList.length; p++) {
										let compare = genresCellList[p];
										if(compare == "Post-Apocalyptic") {
											compare = "PostApocalyptic";
										}
										else if(compare == "Sci-Fi") {
											compare = "SciFi";
										}
										let genreIndex = genreLst.indexOf(compare);
										if(genreIndex == -1) {
											filmObj.genres[2].push(compare);
										}
										else {
											filmObj.genres[1][genreIndex] = true;
										}
									}
									let fldrName = exports.formatFolderName(filmObj.name),
										fldrNum = (fs.readdirSync(path.join(dir, "Trak", "data")).filter(file => fs.statSync(path.join(dir, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-").includes(fldrName)).length);
									// Create the assets folder.
									log.info("Creating the record assets folder associated to the film " + filmObj.name);
									fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Film-" + fldrName + "-" + fldrNum, "assets"), { "recursive": true });
									// Check the assets that were imported from the associated zip file and add the images to the film record object.
									for(let q = 0; q <= fldrNum; q++) {
										let assetsFolder = path.join(dir, "Trak", "importTemp", "Film-" + fldrName + "-" + q, "assets");
										if(fs.existsSync(assetsFolder)) {
											log.info("Copying over the record assets for " + filmObj.name + ".");
											fs.readdirSync(assetsFolder).forEach(asset => {
												if(imgExtArr.includes(path.extname(asset))) {
													filmObj.img.push(path.join(fileData, "Film-" + fldrName + "-" + q, "assets", asset));
												}
											});
										}
									}
									if(filmObj.img.length == 0) { filmObj.img.push(""); }
									// Write data.json file associated to the film record.
									log.info("Writing the data file associated to the film " + filmObj.name);
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Film-" + fldrName + "-" + fldrNum, "data.json"), JSON.stringify(filmObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
							// Handle the import of manga records.
							else if(elem.name == "Category-Manga") {
								log.info("Importing the manga records.");
								// Get the list of manga genres.
								let genreLst = exports.genreList("Manga");
								// Iterate through all the rows of the manga worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to a manga record.
									let mangaObj = {
										"category": "Manga",
										"name": (typeof elem.getCell("A" + q).value === "object" && elem.getCell("A" + q).value !== null) ? elem.getCell("A" + q).value.text : elem.getCell("A" + q).value,
										"jname": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
										"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "", 
										"writers": elem.getCell("F" + q).value != "N/A" ? elem.getCell("F" + q).value : "", 
										"illustrators": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "", 
										"publisher": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "", 
										"jpublisher": elem.getCell("I" + q).value != "N/A" ? elem.getCell("I" + q).value : "", 
										"demographic": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "", 
										"start": "", 
										"end": "", 
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "", 
										"img": [],
										"content": []
									};
									// Update the genres of the manga record object.
									let genresHolder = elem.getCell("M" + q).value,
										genresCellList = ((genresHolder != null && genresHolder != "" && genresHolder != "N/A") ? genresHolder.split(",").map(elem => elem.trim()) : []);
									for(let p = 0; p < genresCellList.length; p++) {
										let compare = genresCellList[p];
										if(compare == "Coming-of-Age") {
											compare = "ComingOfAge";
										}
										else if(compare == "Post-Apocalyptic") {
											compare = "PostApocalyptic";
										}
										else if(compare == "Sci-Fi") {
											compare = "SciFi";
										}
										else if(compare == "Slice of Life") {
											compare = "SliceOfLife";
										}
										let genreIndex = genreLst.indexOf(compare);
										if(genreIndex == -1) {
											mangaObj.genres[2].push(compare);
										}
										else {
											mangaObj.genres[1][genreIndex] = true;
										}
									}
									// Update the start date of the manga record object.
									if(elem.getCell("K" + q).value != "" && elem.getCell("K" + q).value != "N/A") {
										relDateArr = elem.getCell("K" + q).value.split("-");
										mangaObj.start = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the end date of the manga record object.
									if(elem.getCell("L" + q).value != "" && elem.getCell("L" + q).value != "N/A") {
										relDateArr = elem.getCell("L" + q).value.split("-");
										mangaObj.end = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// If the user requests a detailed import then update the related content of the manga record object.
									if(full == true) {
										// Iterate through all workbook worksheets.
										wb.worksheets.forEach(newElem => {
											// Detect the manga record detailed worksheet by its name.
											if(newElem.name == "Manga-" + mangaObj.name.split(" ").map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25)) {
												// Iterate through the detailed worksheet's rows.
												for(let l = 2; l < newElem.rowCount + 1; l++) {
													let detailedObj = {
														"scenario": newElem.getCell("A" + l).value != "N/A" ? newElem.getCell("A" + l).value : "Chapter",
														"name": newElem.getCell("B" + l).value != "N/A" ? newElem.getCell("B" + l).value : "",
														"release": "",
														"read": "",
														"rating": newElem.getCell("F" + l).value != "N/A" ? parseInt(newElem.getCell("F" + l).value) : "",
														"review": newElem.getCell("H" + l).value != "N/A" ? newElem.getCell("H" + l).value : ""
													};
													if(newElem.getCell("D" + l).value != "" && newElem.getCell("D" + l).value != "N/A") {
														relDateArr = newElem.getCell("D" + l).value.split("-");
														detailedObj.release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
													}
													if(newElem.getCell("E" + l).value != "" && newElem.getCell("E" + l).value != "N/A") {
														relDateArr = newElem.getCell("E" + l).value.split("-");
														detailedObj.read = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
													}
													if(detailedObj.scenario == "Volume") {
														detailedObj.isbn = newElem.getCell("C" + l).value != "N/A" ? exports.formatISBNString(newElem.getCell("C" + l).value) : "";
														detailedObj.synopsis = newElem.getCell("G" + l).value != "N/A" ? newElem.getCell("G" + l).value : "";
													}
													mangaObj.content.push(detailedObj);
												}
											}
										});
									}
									else {
										mangaObj.content.push({"scenario": "Volume", "name": "Imported Data", "release": "", "read": "", "rating": (elem.getCell("C" + q).value != "N/A" ? elem.getCell("C" + q).value : ""), "review": ""})
									}
									let fldrName = exports.formatFolderName(mangaObj.name),
										fldrNum = (fs.readdirSync(path.join(dir, "Trak", "data")).filter(file => fs.statSync(path.join(dir, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-").includes(fldrName)).length);
									// Create the assets folder.
									log.info("Creating the record assets folder associated to the manga " + (mangaObj.name != "" ? mangaObj.name : mangaObj.jname));
									fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Manga-" + fldrName + "-" + fldrNum, "assets"), { "recursive": true });
									// Check the assets that were imported from the associated zip file and add the images to the manga record object.
									for(let q = 0; q <= fldrNum; q++) {
										let assetsFolder = path.join(dir, "Trak", "importTemp", "Manga-" + fldrName + "-" + q, "assets");
										if(fs.existsSync(assetsFolder)) {
											log.info("Copying over the record assets for " + mangaObj.name + ".");
											fs.readdirSync(assetsFolder).forEach(asset => {
												if(imgExtArr.includes(path.extname(asset))) {
													mangaObj.img.push(path.join(fileData, "Manga-" + fldrName + "-" + q, "assets", asset));
												}
											});
										}
									}
									if(mangaObj.img.length == 0) { mangaObj.img.push(""); }
									// Write data.json file associated to the manga record.
									log.info("Writing the data file associated to the manga " + mangaObj.name);
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Manga-" + fldrName + "-" + fldrNum, "data.json"), JSON.stringify(mangaObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
							// Handle the import of show records.
							else if(elem.name == "Category-Show") {
								log.info("Importing the show records.");
								// Get the list of show genres.
								let genreLst = exports.genreList("Show");
								// Iterate through all the rows of the show worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to a show record.
									let showObj = {
										"category": "Show",
										"name": (typeof elem.getCell("A" + q).value === "object" && elem.getCell("A" + q).value !== null) ? elem.getCell("A" + q).value.text : elem.getCell("A" + q).value,
										"alternateName": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
										"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "",
										"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "",
										"runTime": elem.getCell("F" + q).value != "N/A" ? String(parseInt(elem.getCell("F" + q).value)) : "",
										"directors": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "",
										"editors": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "",
										"writers": elem.getCell("I" + q).value != "N/A" ? elem.getCell("I" + q).value : "",
										"cinematographers": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "",
										"musicians": elem.getCell("K" + q).value != "N/A" ? elem.getCell("K" + q).value : "",
										"distributors": elem.getCell("L" + q).value != "N/A" ? elem.getCell("L" + q).value : "",
										"producers": elem.getCell("M" + q).value != "N/A" ? elem.getCell("M" + q).value : "",
										"productionCompanies": elem.getCell("N" + q).value != "N/A" ? elem.getCell("N" + q).value : "",
										"stars": elem.getCell("O" + q).value != "N/A" ? elem.getCell("O" + q).value : "",
										"release": "",
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"img": [],
										"content": []
									};
									// Update the release date of the show record object.
									if(elem.getCell("P" + q).value != "" && elem.getCell("P" + q).value != "N/A") {
										relDateArr = elem.getCell("P" + q).value.split("-");
										showObj.release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the genres of the show record object.
									let genresHolder = elem.getCell("Q" + q).value,
										genresCellList = ((genresHolder != null && genresHolder != "" && genresHolder != "N/A") ? genresHolder.split(",").map(elem => elem.trim()) : []);
									for(let p = 0; p < genresCellList.length; p++) {
										let compare = genresCellList[p];
										if(compare == "Post-Apocalyptic") {
											compare = "PostApocalyptic";
										}
										else if(compare == "Sci-Fi") {
											compare = "SciFi";
										}
										let genreIndex = genreLst.indexOf(compare);
										if(genreIndex == -1) {
											showObj.genres[2].push(compare);
										}
										else {
											showObj.genres[1][genreIndex] = true;
										}
									}
									// If the user requests a detailed import then update the related content of the show record object.
									if(full == true) {
										// Iterate through all workbook worksheets.
										wb.worksheets.forEach(newElem => {
											// Detect the show record detailed worksheet by its name.
											if(newElem.name == "Show-" + showObj.name.split(" ").map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("").replace(/\*|\?|\:|\\|\/|\[|\]/g, "-").substring(0, 25)) {
												showObj.content = [];
												// Iterate through the detailed worksheet's rows.
												for(let l = 2; l < newElem.rowCount + 1; l++) {
													// Iterate through all corresponding rows and add the season as an object to the related content array.
													let seasonContentObj = {
														"scenario": "Season",
														"name": newElem.getCell("A" + l).value != "N/A" ? newElem.getCell("A" + l).value : "",
														"start": "",
														"end": "",
														"status": newElem.getCell("D" + l).value != "N/A" ? newElem.getCell("D" + l).value : "",
														"episodes": []
													};
													if(newElem.getCell("B" + l).value != "" && newElem.getCell("B" + l).value != "N/A") {
														relDateArr = newElem.getCell("B" + l).value.split("-");
														seasonContentObj.start = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
													}
													if(newElem.getCell("C" + l).value != "" && newElem.getCell("C" + l).value != "N/A") {
														relDateArr = newElem.getCell("C" + l).value.split("-");
														seasonContentObj.end = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
													}
													while(newElem.getCell("A" + l).value == seasonContentObj.name) {
														let episodeContentObj = {
															"name": newElem.getCell("H" + l).value != "N/A" ? newElem.getCell("H" + l).value : "",
															"watched": "",
															"rating": newElem.getCell("F" + l).value != "N/A" ? parseInt(newElem.getCell("F" + l).value) : "",
															"review": newElem.getCell("I" + l).value != "N/A" ? newElem.getCell("I" + l).value : ""
														};
														if(newElem.getCell("E" + l).value != "" && newElem.getCell("E" + l).value != "N/A") {
															relDateArr = newElem.getCell("E" + l).value.split("-");
															episodeContentObj.watched = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
														}
														seasonContentObj.episodes.push(episodeContentObj);
														l++;
													}
													showObj.content.push(seasonContentObj);
												}
											}
										});
									}
									else {
										showObj.content.push({"scenario": "Season", "name": "Imported Data", "start": showObj.release, "end": "", "status": "", "episodes": [{
											"name": "Imported Data",
											"watched": "",
											"rating": (elem.getCell("C" + q).value != "N/A" ? elem.getCell("C" + q).value : ""),
											"review": ""
										}]});
									}
									let fldrName = exports.formatFolderName(showObj.name),
										fldrNum = (fs.readdirSync(path.join(dir, "Trak", "data")).filter(file => fs.statSync(path.join(dir, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-").includes(fldrName)).length);
									// Create the assets folder.
									log.info("Creating the record assets folder associated to the show " + showObj.name);
									fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Show-" + fldrName + "-" + fldrNum, "assets"), { "recursive": true });
									// Check the assets that were imported from the associated zip file and add the images to the show record object.
									for(let q = 0; q <= fldrNum; q++) {
										let assetsFolder = path.join(dir, "Trak", "importTemp", "Show-" + fldrName + "-" + q, "assets");
										if(fs.existsSync(assetsFolder)) {
											log.info("Copying over the record assets for " + showObj.name + ".");
											fs.readdirSync(assetsFolder).forEach(asset => {
												if(imgExtArr.includes(path.extname(asset))) {
													showObj.img.push(path.join(fileData, "Show-" + fldrName + "-" + q, "assets", asset));
												}
											});
										}
									}
									if(showObj.img.length == 0) { showObj.img.push(""); }
									// Write data.json file associated to the show record.
									log.info("Writing the data file associated to the show " + showObj.name);
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Show-" + fldrName + "-" + fldrNum, "data.json"), JSON.stringify(showObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
						});
					});
					// Once all records have been imported into the temporary folder check them against the current ones to see which ones will be kept.
					workbookPromise.then(() => exports.importCompare(fs, path, log, ipc, aniTool, bookTool, movTool, win, eve, res, dir, fileData, xlsxFile, "XLSX"))
						.catch(wbErr => log.error("There was an issue in resolving the promise associated to importing the xlsx file " + xlsxFile + ". Error Type: " + wbErr.name + ". Error Message: " + wbErr.message + "."));
				}).catch(xlsxReadErr => log.error("There was an issue in reading the xlsx file " + xlsxFile + ". Error Type: " + xlsxReadErr.name + ". Error Message: " + xlsxReadErr.message + "."));
			}
		});
	});
};



/*

Iterates through the list of xlsx files to be imported by waiting for each one to finish prior to proceeding to the next one.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- malTool, goodReadsTool, and imdbTool provide the means to obtain record details from online sources.
	- zipper is a library object which can create zip files.
	- ExcelJS provides the means to export/import xlsx files.
	- mainWin is an object referencing the primary window of the Electron app.
	- ogPath is a string representing the base directory corresponding to the location of the configuration file.
	- evnt is the object which allows for interaction with the fron-end of the Electron application.
	- lst is the list of zip files to be imported.
	- detailed is a boolean representing whether the xlsx file should contain only basic details or everything.

*/ 
exports.importDriverXLSX = async (fs, path, log, ipc, malTool, goodReadsTool, imdbTool, zipper, ExcelJS, mainWin, ogPath, evnt, lst, detailed = false) => {
  	for(let i = 0; i < lst.length; i++) {
    	await exports.importDataXLSX(fs, path, log, ipc, malTool, goodReadsTool, imdbTool, zipper, ExcelJS, mainWin, evnt, ogPath, lst[i], detailed);
  	}
};



/*

Reads a zip file and adds its content to the library records.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- aniTool, bookTool, and movTool provide the means to obtain record details from online sources.
	- zipper is a library object which can create zip files.
	- win is an object referencing the primary window of the Electron app.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- zipFile is the zip file to be imported.

*/ 
exports.importDataZIP = async (fs, path, log, ipc, aniTool, bookTool, movTool, zipper, win, eve, dir, zipFile) => {
	log.info("The ZIP import process has started.");
	return new Promise((res, rej) => {
		// If the importTemp folder does not exist, then create it.
		const importTempFolder = path.join(dir, "Trak", "importTemp");
		if(!fs.existsSync(importTempFolder)) {
			log.info("Creating the importTemp folder. To be located at " + importTempFolder);
			fs.mkdirSync(importTempFolder);
		}
		// Otherwise empty it.
		else {
			log.info("Emptying the importTemp folder.");
			fs.emptyDirSync(importTempFolder);
		}
		// Read the settings configuration file.
		fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
			// If there was an issue reading the settings configuration file notify the user.
			if(err) {
				log.error("There was an issue in reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
				eve.sender.send("configurationFileOpeningFailure");
			}
			else {
				log.info("The settings configuration file has been successfully read.");
				// Define the configuration file data and associated library records path.
				const fileData = JSON.parse(fileContent).current != undefined ? JSON.parse(fileContent).current.path : JSON.parse(fileContent).original.path;
				// Unzip the zip file.
				zipper.unzip(zipFile, (er, unzipped) => {
					// If there was an issue unzipping the zip file notify the user.
					if(er) {
						log.error("There was an issue in unzipping the import file " + zipFile + ". Error Type: " + er.name + ". Error Message: " + er.message + ".")
						eve.sender.send("importUnzippingFailure", zipFile);
					}
					else {
						log.info("The import file " + zipFile + " has been successfully unzipped.");
						// Save the contents of the zip file to the importTemp folder.
						unzipped.save(path.join(dir, "Trak", "importTemp"), issue => {
							// If there was an issue saving the contents of the zip file notify the user.
							if(issue) {
								log.error("There was an issue in saving the contents of the import file " + zipFile + ". Error Type: " + issue.name + ". Error Message: " + issue.message + ".")
								eve.sender.send("importZipFileFailure", zipFile);
							}
							// Once all records have been imported into the temporary folder check them against the current ones to see which ones will be kept.
							else { exports.importCompare(fs, path, log, ipc, aniTool, bookTool, movTool, win, eve, res, dir, fileData, zipFile, "ZIP"); }
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
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- malTool, goodReadsTool, and imdbTool provide the means to obtain record details from online sources.
	- zipper is a library object which can create zip files.
	- mainWin is an object referencing the primary window of the Electron app.
	- ogPath is a string representing the base directory corresponding to the location of the configuration file.
	- evnt is the object which allows for interaction with the fron-end of the Electron application.
	- lst is the list of zip files to be imported.

*/ 
exports.importDriverZIP = async (fs, path, log, ipc, malTool, goodReadsTool, imdbTool, zipper, mainWin, ogPath, evnt, lst) => {
  	for(let i = 0; i < lst.length; i++) {
    	await exports.importDataZIP(fs, path, log, ipc, malTool, goodReadsTool, imdbTool, zipper, mainWin, evnt, ogPath, lst[i]);
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
	- fs and path provide the means to work with file paths.
	- log provides the means to create application logs to keep track of what is going on.
	- devCheck is a boolean representing whether the app is being run in a development mode.
	- width and height are the physical parameters for describing the created window size.
	- fullscreen is a boolean representing whether the window should be maximized on launch.
	- resizable is a boolean representing whether a window should be allowed to rescale.

*/
exports.createWindow = (extension, dir, BrowserWindow, fs, path, log, devCheck, width = 1000, height = 800, fullscreen = false, resizable = true) => {
  	let iconPath = "";
  	if(fs.existsSync(path.join(dir, "Trak", "config", "configuration.json"))) {
  		const conData = JSON.parse(fs.readFileSync(path.join(dir, "Trak", "config", "configuration.json"), "UTF8"));
  		iconPath = path.join(__dirname, "../../../assets", (conData.current != undefined ? conData.current.icon : conData.original.icon) + "Logo.ico");
  	}
  	else {
  		iconPath = path.join(__dirname, "../../../assets", "whiteLogo.ico");
  	}
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
    	"icon": iconPath,
    	"frame": false,
    	"titleBarStyle": "hidden"
	});
	extension != "splash" ? win.loadFile(path.join(dir, "Trak", "localPages", extension + ".html")) : win.loadFile(path.join(__dirname, "../../../pages", "dist", extension + ".html"));
	if(fullscreen == true) { win.maximize(); }
	log.info("The " + extension + ".html page is now loading.");
	if(devCheck == true) { win.webContents.openDevTools(); }
  	return win;
};



/*

Tells the front-end to load the application tutorial.

	- fs and path provide the means to work with local files.
	- win is the primary window of the app.
	- sysPath is the system location for the application configuration.

*/
exports.tutorialLoad = (fs, path, log, win, sysPath) => {
	if(!fs.existsSync(path.join(sysPath, "Trak", "config", "tutorial.json"))) {
		log.info("Loading the application tutorial for the index.html page for a first-time user.");
		win.webContents.send("introduction", false);
	}
	else {
		const intro = JSON.parse(fs.readFileSync(path.join(sysPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction;
		if(intro == true) {
			log.info("Loading the application tutorial for the index.html page for a returning user.");
			win.webContents.send("introduction", true);
		}
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

Formats a folder name into a readable form for logging purposes.

	- fldr is a string corresponding to a folder name in the library records.

*/
exports.parseFolder = fldr => {
	let hldr = fldr.split("-")[0];
    return nameStr = hldr.toLowerCase() + " " + fldr.substring(hldr.length + 1, fldr.lastIndexOf("-"));
};



module.exports = exports;