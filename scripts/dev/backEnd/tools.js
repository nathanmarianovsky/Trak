/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - formatFolderName: Formats a string into a proper folder name by removing forbidden characters and whitespaces.
   - objCreationImgs: Downloads images associated to a record and returns an array to their location.
   - writeDataFile: Handles the writing of files associated to a record.
   - removeRecords: Handles the removal of records by deleting the associated folders and data file.
   - arrayMove: Moves an element in an array.
   - animeGenreList: Provides the list of all genres/tags that can be selected on the addRecord.html page for an anime record.
   - calculateReleaseDate: Calculate the earliest release date of an anime record based on the related content information.
   - calculateGlobalRating: Calculate the average rating of an anime record based on the related content information.
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
   - startCommandLineFolder: Provides the necessary command to execute the opening of a folder.
   - isURL: Tests whether a given string represents a url.
   - checkForUpdate: Checks against the most recent release on github to determine if an update is available.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Formats a string into a proper folder name by removing forbidden characters and whitespaces.

   - str is the string representing a candidate for a folder name. 

*/
exports.formatFolderName = str => str.replace(/[/\\?%*:|"<>]/g, "_").replace(/\#/g, "_").replace(/\,/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("");



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
				console.log(recordDir);
				let copyFilePath = path.join(dir, "Trak", "data", recordDir, "assets", path.basename(providedImgs[1][y]));
				console.log(copyFilePath);
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
		fldr = info[0] + "-" + exports.formatFolderName(info[1] != "" ? info[1] : info[2]);
	}
	else if(info[0] == "Book") {
		fldr = info[0] + "-" + info[3] + "-" + exports.formatFolderName(info[1]);
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

Provides the list of all genres/tags that can be selected on the addRecord.html page for an anime record.

*/
exports.animeGenreList = () => {
    return ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Mystery", "Magic",
            "MagicalSexShift", "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police",
            "PostApocalyptic", "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai",
            "School", "SciFi", "Seinen", "Shoujo", "Shounen", "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame",
            "SuperPower", "Supernatural", "Survival", "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy",
            "Vampire", "VideoGame", "War", "Western", "Workplace", "Yaoi", "Yuri"];
};



/*

Provides the list of all genres/tags that can be selected on the addRecord.html page for a book record.

*/
exports.bookGenreList = () => {
    return ["Action", "Adventure", "Comedy", "Crime", "Dystopian", "Fantasy", "Fiction", "Historical", "Horror", "Mystery",
            "Mythology", "Nonfiction", "Romance", "Satire", "Sci-Fi", "Thriller", "Tragedy", "Western"];
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
exports.calculateGlobalRating = contentArr => {
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
			log.error("There was an error in reading the settings configuration file.");
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
				bookWorksheet = workbook.addWorksheet("Category-Book");
			animeWorksheet.views = [{"state": "frozen", "xSplit": 1, "ySplit": 1, "activeCell": "A2"}];
			bookWorksheet.views = [{"state": "frozen", "xSplit": 1, "ySplit": 1, "activeCell": "A2"}];
			// Update the style of the first row.
			animeWorksheet.getRow(1).height = 20;
			bookWorksheet.getRow(1).height = 20;
			animeWorksheet.getRow(1).alignment = { "vertical": "middle", "horizontal": "center" };
			bookWorksheet.getRow(1).alignment = { "vertical": "middle", "horizontal": "center" };
			animeWorksheet.getRow(1).border = {
				"top": { "style": "thin" },
				"left": { "style": "thin" },
				"bottom": { "style": "thin" },
				"right": { "style": "thin" }
			};
			bookWorksheet.getRow(1).border = {
				"top": { "style": "thin" },
				"left": { "style": "thin" },
				"bottom": { "style": "thin" },
				"right": { "style": "thin" }
			};
			animeWorksheet.getRow(1).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
			bookWorksheet.getRow(1).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
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
			// Iterate through all records the user desires to export.
			let animeRowCounter = 0,
				bookRowCounter = 0;
			for(let x = 0; x < records.length; x++) {
				// Define the data associated to an anime record.
				let iterData = JSON.parse(fs.readFileSync(path.join(dataPath, records[x], "data.json"), "UTF8"));
				// Generate the worksheets associated to anime library records.
				if(iterData.category == "Anime") {
					// Update each row with the relevant anime record details on the anime worksheet.
					animeWorksheet.getRow(animeRowCounter + 2).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
					animeWorksheet.getRow(animeRowCounter + 2).height = 75;
					animeWorksheet.getRow(animeRowCounter + 2).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("A" + (animeRowCounter + 2)).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
					animeWorksheet.getCell("A" + (animeRowCounter + 2)).border = { "top": { "style": "thin" }, "left": { "style": "thin" }, "bottom": { "style": "thin" }, "right": { "style": "thin" } };
					animeWorksheet.getCell("A" + (animeRowCounter + 2)).value = iterData.name;
					animeWorksheet.getCell("B" + (animeRowCounter + 2)).value = iterData.jname != "" ? iterData.jname : "N/A";
					animeWorksheet.getCell("C" + (animeRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					animeWorksheet.getCell("C" + (animeRowCounter + 2)).value = exports.calculateGlobalRating(iterData.content);
					animeWorksheet.getCell("D" + (animeRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					animeWorksheet.getCell("E" + (animeRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					animeWorksheet.getCell("F" + (animeRowCounter + 2)).value = iterData.directors != "" ? iterData.directors : "N/A";
					animeWorksheet.getCell("G" + (animeRowCounter + 2)).value = iterData.producers != "" ? iterData.producers : "N/A";
					animeWorksheet.getCell("H" + (animeRowCounter + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					animeWorksheet.getCell("I" + (animeRowCounter + 2)).value = iterData.musicians != "" ? iterData.musicians : "N/A";
					animeWorksheet.getCell("J" + (animeRowCounter + 2)).value = iterData.studio != "" ? iterData.studio : "N/A";
					animeWorksheet.getCell("K" + (animeRowCounter + 2)).value = iterData.license != "" ? iterData.license : "N/A";
					animeWorksheet.getCell("L" + (animeRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					let dateArr = exports.calculateReleaseDate(iterData.content).split("-");
					animeWorksheet.getCell("L" + (animeRowCounter + 2)).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
					let filterGenreStrArr = [];
					for(let f = 0; f < iterData.genres[0].length; f++) {
						if(iterData.genres[1][f] == true) {
				            if(iterData.genres[0][f] == "CGDCT") {
				                filterGenreStrArr.push("CGDCT");
				            }
				            else if(iterData.genres[0][f] == "ComingOfAge") {
				                filterGenreStrArr.push("Coming-of-Age");
				            }
				            else if(iterData.genres[0][f] == "PostApocalyptic") {
				                filterGenreStrArr.push("Post-Apocalyptic");
				            }
				            else if(iterData.genres[0][f] == "SciFi") {
				                filterGenreStrArr.push("Sci-Fi");
				            }
				            else if(iterData.genres[0][f] == "SliceOfLife") {
				                filterGenreStrArr.push("Slice of Life");
				            }
				            else {
				                filterGenreStrArr.push(iterData.genres[0][f].split(/(?=[A-Z])/).join(" "));
				            }
						}
					}
					filterGenreStrArr = filterGenreStrArr.concat(iterData.genres[2]);
					filterGenreStrArr.sort((a, b) => a.localeCompare(b));
					animeWorksheet.getCell("M" + (animeRowCounter + 2)).value = filterGenreStrArr.length > 0 ? filterGenreStrArr.join(", ") : "N/A";
					// If the user desires to export a detailed xlsx file then create a new worksheet for each anime record and populate it with the related content information.
					if(detailed == true) {
						// Define the worksheet associated to the anime record.
						let detailedWorksheet = workbook.addWorksheet("Anime-" + iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""));
						detailedWorksheet.views = [{"state": "frozen", "ySplit": 1, "activeCell": "A2"}];
						// Update the style of the first row.
						detailedWorksheet.getRow(1).height = 20;
						detailedWorksheet.getRow(1).alignment = { "vertical": "middle", "horizontal": "center" };
						detailedWorksheet.getRow(1).border = {
							"top": { "style": "thin" },
							"left": { "style": "thin" },
							"bottom": { "style": "thin" },
							"right": { "style": "thin" }
						};
						detailedWorksheet.getRow(1).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
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
									detailedWorksheet.getRow(rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getRow(rowPos).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
									detailedWorksheet.getRow(rowPos).height = 75;
									detailedWorksheet.getCell("A" + rowPos).value = "Season";
									detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
									detailedWorksheet.getCell("C" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].start.split("-");
									detailedWorksheet.getCell("C" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("D" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].end.split("-");
									detailedWorksheet.getCell("D" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("E" + rowPos).value = iterData.content[v].status != "" ? iterData.content[v].status : "N/A";
									detailedWorksheet.getCell("F" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].episodes[t].watched.split("-");
									detailedWorksheet.getCell("F" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("G" + rowPos).alignment = { "vertical": "middle", "horizontal": "center" };
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
								detailedWorksheet.getRow(rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getRow(rowPos).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
								detailedWorksheet.getRow(rowPos).height = 75;
								detailedWorksheet.getCell("A" + rowPos).value = iterData.content[v].type != "" ? iterData.content[v].type : "Single";
								detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								detailedWorksheet.getCell("C" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								dateArr = iterData.content[v].release.split("-");
								detailedWorksheet.getCell("C" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("D" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								detailedWorksheet.getCell("D" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("E" + rowPos).value = "N/A";
								detailedWorksheet.getCell("F" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								dateArr = iterData.content[v].watched.split("-");
								detailedWorksheet.getCell("F" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("G" + rowPos).alignment = { "vertical": "middle", "horizontal": "center" };
								detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].rating != "" ? iterData.content[v].rating : "N/A";
								detailedWorksheet.getCell("H" + rowPos).value = "1";
								detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								detailedWorksheet.getCell("J" + rowPos).value = iterData.content[v].review != "" ? iterData.content[v].review : "N/A";
								rowPos++;
							}
						}
						// For a detailed xlsx export the names on the anime worksheet become hyperlinks to their respective worksheet.
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).value = { hyperlink: "#\'Anime-" + iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("") + "\'!A2", text: iterData.name }
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).font.underline = true;
						animeWorksheet.getCell("A" + (animeRowCounter + 2)).font.color = { "argb": "FF0000FF" };
					}
					animeRowCounter++;
				}
				else if(iterData.category == "Book") {
					// Update each row with the relevant book record details on the book worksheet.
					bookWorksheet.getRow(bookRowCounter + 2).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
					bookWorksheet.getRow(bookRowCounter + 2).height = 75;
					bookWorksheet.getRow(bookRowCounter + 2).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					bookWorksheet.getCell("A" + (bookRowCounter + 2)).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
					bookWorksheet.getCell("A" + (bookRowCounter + 2)).border = { "top": { "style": "thin" }, "left": { "style": "thin" }, "bottom": { "style": "thin" }, "right": { "style": "thin" } };
					bookWorksheet.getCell("A" + (bookRowCounter + 2)).value = iterData.name;
					bookWorksheet.getCell("B" + (bookRowCounter + 2)).value = iterData.originalName != "" ? iterData.originalName : "N/A";
					bookWorksheet.getCell("C" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					bookWorksheet.getCell("C" + (bookRowCounter + 2)).value = iterData.rating != "" ? iterData.rating : "N/A";
					bookWorksheet.getCell("D" + (bookRowCounter + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					bookWorksheet.getCell("E" + (bookRowCounter + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					bookWorksheet.getCell("F" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					bookWorksheet.getCell("F" + (bookRowCounter + 2)).value = iterData.isbn != "" ? exports.formatISBNString(iterData.isbn) : "N/A";
					bookWorksheet.getCell("G" + (bookRowCounter + 2)).value = iterData.authors != "" ? iterData.authors : "N/A";
					bookWorksheet.getCell("H" + (bookRowCounter + 2)).value = iterData.publisher != "" ? iterData.publisher : "N/A";
					bookWorksheet.getCell("I" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					let publicationDateArr = iterData.publicationDate.split("-");
					bookWorksheet.getCell("I" + (bookRowCounter + 2)).value = publicationDateArr.length == 3 ? publicationDateArr[1] + "-" + publicationDateArr[2] + "-" + publicationDateArr[0] : "N/A";
					bookWorksheet.getCell("J" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					bookWorksheet.getCell("J" + (bookRowCounter + 2)).value = iterData.pages != "" ? iterData.pages : "N/A";
					bookWorksheet.getCell("K" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					bookWorksheet.getCell("K" + (bookRowCounter + 2)).value = exports.formatMedia(iterData.media);
					bookWorksheet.getCell("L" + (bookRowCounter + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					let lastReadArr = iterData.lastRead.split("-");
					bookWorksheet.getCell("L" + (bookRowCounter + 2)).value = lastReadArr.length == 3 ? lastReadArr[1] + "-" + lastReadArr[2] + "-" + lastReadArr[0] : "N/A";
					let filterGenreStrArr = [];
					for(let f = 0; f < iterData.genres[0].length; f++) {
						if(iterData.genres[1][f] == true) {
				            if(iterData.genres[0][f] == "CGDCT") {
				                filterGenreStrArr.push("CGDCT");
				            }
				            else if(iterData.genres[0][f] == "ComingOfAge") {
				                filterGenreStrArr.push("Coming-of-Age");
				            }
				            else if(iterData.genres[0][f] == "PostApocalyptic") {
				                filterGenreStrArr.push("Post-Apocalyptic");
				            }
				            else if(iterData.genres[0][f] == "SciFi") {
				                filterGenreStrArr.push("Sci-Fi");
				            }
				            else if(iterData.genres[0][f] == "SliceOfLife") {
				                filterGenreStrArr.push("Slice of Life");
				            }
				            else {
				                filterGenreStrArr.push(iterData.genres[0][f].split(/(?=[A-Z])/).join(" "));
				            }
						}
					}
					filterGenreStrArr = filterGenreStrArr.concat(iterData.genres[2]);
					filterGenreStrArr.sort((a, b) => a.localeCompare(b));
					bookWorksheet.getCell("M" + (bookRowCounter + 2)).value = filterGenreStrArr.length > 0 ? filterGenreStrArr.join(", ") : "N/A";
					bookRowCounter++;
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
							log.error("There was an error in zipping up the library assets.");
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
									log.error("There was an error in creating the zip file for the library records assets export.");
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
				}).catch(err => log.error("There was an issue in resolving the promise associated to the copying of all records which are to be exported."));
			}).catch(err => log.error("There was an issue in writing the xlsx file " + path.join(xlsxExportFolder, "Trak-" + (detailed == true ? "Detailed-" : "Simple-") + "XLSX-Export-" + fileDate + ".xlsx")));
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
			log.error("There was an error in reading the settings configuration file.");
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
						log.error("There was an error in zipping up the library assets.");
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
										log.error("There was an error in deleting the zip file associated to a previous export today.");
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
									log.error("There was an error in creating the zip file for the library records assets export.");
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
						}).catch(err => log.error("There was an issue in resolving the promise associated to the deletion of a zip file in a previous export."));
					}
				});
			}).catch(err => log.error("There was an issue in resolving the promise associated to the copying of all records which are to be exported."));
		}
	});
};



/*

Finishes the application import process by checking whether the new records already exist in the library.

	- fs and path provide the means to work with local files.
	- ipc provides the means to operate the Electron app.
	- appWin is an object referencing the primary window of the Electron app.
	- winEvent is the object which allows for interaction with the fron-end of the Electron application.
	- promiseResolver is the resolver callback for the file import promise.
	- configFir is a string representing the base directory corresponding to the location of the configuration file.
	- dataDir is the directory where the user library records are stored.
	- impFile is the zip file to be imported.
	- mode is a string corresponding to which import process is being utilized.

*/ 
exports.importCompare = (fs, path, log, ipc, appWin, winEvent, promiseResolver, configDir, dataDir, impFile, mode) => {
	// Compare the list of records in the zip file and compare them to the current library records to see which reference the same record.
	let list = fs.readdirSync(path.join(configDir, "Trak", "importTemp")).filter(file => fs.statSync(path.join(path.join(configDir, "Trak", "importTemp"), file)).isDirectory()),
		listFilterDoExist = list.filter(elem => fs.existsSync(path.join(dataDir, elem))),
		listFilterDoNotExist = list.filter(elem => !fs.existsSync(path.join(dataDir, elem)));
	// If there are records being imported which do not exist in the current library records simply copy them over.
	if(listFilterDoNotExist.length > 0) {
		log.info("The " + mode + " import process is copying over import records which do not currently exist in the library records.");
		listFilterDoNotExist.forEach(elem => { fs.moveSync(path.join(configDir, "Trak", "importTemp", elem), path.join(dataDir, elem)); });
	}
	// If there are no records being imported which do exist in the current library records then empty the importTemp folder, reload the primary window, and notify the user that the zip file has been imported.
	if(listFilterDoExist.length == 0) {
		log.info("Emptying the importTemp folder.");
		fs.emptyDirSync(path.join(configDir, "Trak", "importTemp"));
		appWin.reload();
		setTimeout(() => {
			promiseResolver();
			appWin.webContents.send("importFileSuccess", impFile);
			log.info("The " + mode + " import process has ended.");
		}, 1000);
	}
	else {
		// If there are records being imported which do exist in the current library records notify the user.
		winEvent.sender.send("importRecordExists", [listFilterDoExist, listFilterDoExist.map(elem => {
			let associatedData = JSON.parse(fs.readFileSync(path.join(dataDir, elem, "data.json")));
			return [associatedData.category, associatedData.name];
		})]);
		// Once the user chooses which records to overwrite proceed by copying them from the importTemp folder.
		ipc.once("importOveride", (event, overwriteList) => {
			log.info("The " + mode + " import process is copying over import records which currently exist in the library records.");
			let savePromise = new Promise((resolve, reject) => {
			    overwriteList[0].forEach((elem, index, arr) => {
					if(overwriteList[1][index] == true) {
						fs.moveSync(path.join(configDir, "Trak", "importTemp", elem), path.join(dataDir, elem), {"overwrite": true});
					}
					if(index == arr.length - 1) { resolve(); }
				});
			});
			// Once the desired records have been overwritten empty the importTemp folder, reload the primary window, and notify the user that the zip file has been imported.
			savePromise.then(() => {
				log.info("Emptying the importTemp folder.");
				fs.emptyDirSync(path.join(configDir, "Trak", "importTemp"));
				appWin.reload();
				setTimeout(() => {
					promiseResolver();
					appWin.webContents.send("importFileSuccess", impFile);
					log.info("The " + mode + " import process has ended.");
				}, 1000);
			}).catch(err => log.error("There was an issue in resolving the promise associaed to the overwriting process of imported records."));
		});
	}
};



/*

Reads a xlsx file and adds its content to the library records.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- zipper is a library object which can create zip files.
	- ExcelJS provides the means to export/import xlsx files.
	- win is an object referencing the primary window of the Electron app.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- xlsxFile is the xlsx file to be imported.
	- full is a boolean representing whether the xlsx file should contain only basic details or everything.

*/ 
exports.importDataXLSX = async (fs, path, log, ipc, zipper, ExcelJS, win, eve, dir, xlsxFile, full) => {
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
				log.error("There was an error in reading the settings configuration file.");
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
							// Handle the import of simple anime records.
							if(elem.name == "Category-Anime") {
								log.info("Importing the anime records.");
								// Get the list of anime genres.
								let genreLst = exports.animeGenreList();
								// Iterate through all the rows of the anime worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to an anime record.
									let animeObj = {
										"category": "Anime",
										"name": (typeof elem.getCell("A" + q).value === "object" && elem.getCell("A" + q).value !== null) ? elem.getCell("A" + q).value.text : elem.getCell("A" + q).value,
										"jname": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
										"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "", 
										"directors": elem.getCell("F" + q).value != "N/A" ? elem.getCell("F" + q).value : "", 
										"producers": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "", 
										"writers": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "", 
										"musicians": elem.getCell("I" + q).value != "N/A" ? elem.getCell("I" + q).value : "", 
										"studio": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "", 
										"license": elem.getCell("K" + q).value != "N/A" ? elem.getCell("K" + q).value : "", 
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "", 
										"img": [],
										"content": [{ "scenario": "Single", "name": "Item 1", "type": "", "release": "", "watched": "", "rating": "", "review": "" }]
									};
									// Update the genres of the anime record object.
									let genresCellList = elem.getCell("M" + q).value.split(",").map(elem => elem.trim());
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
											animeObj.genres[2].push(compare);
										}
										else {
											animeObj.genres[1][genreIndex] = true;
										}
									}
									// Update the release date of the anime record object.
									if(elem.getCell("L" + q).value != "" && elem.getCell("L" + q).value != "N/A") {
										relDateArr = elem.getCell("L" + q).value.split("-");
										animeObj.content[0].release = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the rating of the anime record object.
									if(elem.getCell("C" + q).value != "" && elem.getCell("C" + q).value != "N/A") {
										animeObj.content[0].rating = parseInt(elem.getCell("C" + q).value);
									}
									// If the user requests a detailed import then update the related content of the anime record object.
									if(full == true) {
										// Iterate through all workbook worksheets.
										wb.worksheets.forEach(newElem => {
											// Detect the anime record detailed worksheet by its name.
											if(newElem.name == "Anime-" + animeObj.name.split(" ").map(item => item.charAt(0).toUpperCase() + item.slice(1)).join("").substring(0, 25)) {
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
									let fldrName = exports.formatFolderName(animeObj.name);
									// Check the assets that were imported from the associated zip file and add the images to the anime record object.
									let assetsFolder = path.join(dir, "Trak", "importTemp", "Anime-" + fldrName, "assets");
									if(fs.existsSync(assetsFolder)) {
										log.info("Copying over the record assets for " + animeObj.name + ".");
										fs.readdirSync(assetsFolder).forEach(asset => {
											if(imgExtArr.includes(path.extname(asset))) {
												animeObj.img.push(path.join(fileData, "Anime-" + fldrName, "assets", asset));
											}
										});
									}
									// Otherwise if no assets were found then create the assets folder.
									else {
										log.info("Creating the record assets folder associated to the anime " + (animeObj.name != "" ? animeObj.name : animeObj.jname));
										fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Anime-" + fldrName, "assets"), { "recursive": true });
									}
									// Write data.json file associated to the anime record.
									log.info("Writing the data file associated to the anime " + animeObj.name);
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Anime-" + fldrName, "data.json"), JSON.stringify(animeObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
							// Handle the import of book records.
							else if(elem.name == "Category-Book") {
								log.info("Importing the book records.");
								// Get the list of book genres.
								let genreLst = exports.bookGenreList();
								// Iterate through all the rows of the book worksheet.
								for(let q = 2; q < elem.rowCount + 1; q++) {
									// Define the object which will correspond to a book record.
									let bookObj = {
										"category": "Book",
										"name": elem.getCell("A" + q).value,
										"originalName": elem.getCell("B" + q).value != "N/A" ? elem.getCell("B" + q).value : "", 
										"rating": elem.getCell("C" + q).value != "N/A" && elem.getCell("C" + q).value != "" ? parseInt(elem.getCell("C" + q).value) : "",
										"review": elem.getCell("D" + q).value != "N/A" ? elem.getCell("D" + q).value : "",
										"synopsis": elem.getCell("E" + q).value != "N/A" ? elem.getCell("E" + q).value : "",
										"isbn": elem.getCell("F" + q).value != "N/A" ? elem.getCell("F" + q).value.replace(/-/g, "") : "",
										"authors": elem.getCell("G" + q).value != "N/A" ? elem.getCell("G" + q).value : "",
										"publisher": elem.getCell("H" + q).value != "N/A" ? elem.getCell("H" + q).value : "",
										"publicationDate": "",
										"pages": elem.getCell("J" + q).value != "N/A" ? elem.getCell("J" + q).value : "",
										"media": elem.getCell("K" + q).value != "N/A" ? elem.getCell("K" + q).value : "",
										"lastRead": "",
										"genres": [genreLst, new Array(genreLst.length).fill(false), []],
										"img": []
									};
									// Update the publication date of the book record object.
									if(elem.getCell("I" + q).value != "" && elem.getCell("I" + q).value != "N/A") {
										relDateArr = elem.getCell("I" + q).value.split("-");
										bookObj.publicationDate = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the last read date of the book record object.
									if(elem.getCell("L" + q).value != "" && elem.getCell("L" + q).value != "N/A") {
										relDateArr = elem.getCell("L" + q).value.split("-");
										bookObj.lastRead = relDateArr[2] + "-" + relDateArr[0] + "-" + relDateArr[1];
									}
									// Update the genres of the anime record object.
									let genresCellList = elem.getCell("M" + q).value.split(",").map(elem => elem.trim());
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
									let fldrName = bookObj.isbn + "-" + exports.formatFolderName(bookObj.name);
									// Check the assets that were imported from the associated zip file and add the images to the book record object.
									let assetsFolder = path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "assets");
									if(fs.existsSync(assetsFolder)) {
										log.info("Copying over the record assets for " + (bookObj.name != "" ? bookObj.name : bookObj.isbn) + ".");
										fs.readdirSync(assetsFolder).forEach(asset => {
											if(imgExtArr.includes(path.extname(asset))) {
												bookObj.img.push(path.join(fileData, "Book-" + fldrName, "assets", asset));
											}
										});
									}
									// Otherwise if no assets were found then create the assets folder.
									else {
										log.info("Creating the record assets folder associated to the book " + (bookObj.name != "" ? bookObj.name : bookObj.isbn));
										fs.mkdirSync(path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "assets"), { "recursive": true });
									}
									// Write data.json file associated to the book record.
									log.info("Writing the data file associated to the book " + (bookObj.name != "" ? bookObj.name : bookObj.isbn));
									fs.writeFileSync(path.join(dir, "Trak", "importTemp", "Book-" + fldrName, "data.json"), JSON.stringify(bookObj), "UTF8");
									if(q == elem.rowCount) { resolve(); }
								}
							}
						});
					});
					// Once all records have been imported into the temporary folder check them against the current ones to see which ones will be kept.
					workbookPromise.then(() => exports.importCompare(fs, path, log, ipc, win, eve, res, dir, fileData, xlsxFile, "XLSX")).catch(err => log.error("There was an issue in resolving the promise associated to importing the xlsx file " + xlsxFile + "."));
				}).catch(err => log.error("There was an issue in reading the xlsx file " + xlsxFile + "."));
			}
		});
	});
};



/*

Iterates through the list of xlsx files to be imported by waiting for each one to finish prior to proceeding to the next one.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- zipper is a library object which can create zip files.
	- ExcelJS provides the means to export/import xlsx files.
	- mainWin is an object referencing the primary window of the Electron app.
	- ogPath is a string representing the base directory corresponding to the location of the configuration file.
	- evnt is the object which allows for interaction with the fron-end of the Electron application.
	- lst is the list of zip files to be imported.
	- detailed is a boolean representing whether the xlsx file should contain only basic details or everything.

*/ 
exports.importDriverXLSX = async (fs, path, log, ipc, zipper, ExcelJS, mainWin, ogPath, evnt, lst, detailed = false) => {
  	for(let i = 0; i < lst.length; i++) {
    	await exports.importDataXLSX(fs, path, log, ipc, zipper, ExcelJS, mainWin, evnt, ogPath, lst[i], detailed);
  	}
};



/*

Reads a zip file and adds its content to the library records.

	- fs and path provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- ipc provides the means to operate the Electron app.
	- zipper is a library object which can create zip files.
	- win is an object referencing the primary window of the Electron app.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- zipFile is the zip file to be imported.

*/ 
exports.importDataZIP = async (fs, path, log, ipc, zipper, win, eve, dir, zipFile) => {
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
				log.error("There was an error in reading the settings configuration file.");
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
						log.error("There was an error in unzipping the import file " + zipFile + ".")
						eve.sender.send("importUnzippingFailure", zipFile);
					}
					else {
						log.info("The import file " + zipFile + " has been successfully unzipped.");
						// Save the contents of the zip file to the importTemp folder.
						unzipped.save(path.join(dir, "Trak", "importTemp"), issue => {
							// If there was an issue saving the contents of the zip file notify the user.
							if(issue) {
								log.error("There was an error in saving the contents of the import file " + zipFile + ".")
								eve.sender.send("importZipFileFailure", zipFile);
							}
							// Once all records have been imported into the temporary folder check them against the current ones to see which ones will be kept.
							else { exports.importCompare(fs, path, log, ipc, win, eve, res, dir, fileData, zipFile, "ZIP"); }
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
	- zipper is a library object which can create zip files.
	- mainWin is an object referencing the primary window of the Electron app.
	- ogPath is a string representing the base directory corresponding to the location of the configuration file.
	- evnt is the object which allows for interaction with the fron-end of the Electron application.
	- lst is the list of zip files to be imported.

*/ 
exports.importDriverZIP = async (fs, path, log, ipc, zipper, mainWin, ogPath, evnt, lst) => {
  	for(let i = 0; i < lst.length; i++) {
    	await exports.importDataZIP(fs, path, log, ipc, zipper, mainWin, evnt, ogPath, lst[i]);
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
	- path provides the means to work with file paths.
	- log provides the means to create application logs to keep track of what is going on.
	- devCheck is a boolean representing whether the app is being run in a development mode.
	- width and height are the physical parameters for describing the created window size.
	- fullscreen is a boolean representing whether the window should be maximized on launch.
	- resizable is a boolean representing whether a window should be allowed to rescale.

*/
exports.createWindow = (extension, dir, BrowserWindow, path, log, devCheck, width = 1000, height = 800, fullscreen = false, resizable = true) => {
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
	                	log.error("There was an issue reading the location.json file.");
	                	win.webContents.send("locationFileIssue");
	                }
	                // Compare the current version against the latest version on github to determine whether an update is available.
	                else if(require("semver").gt(githubData.tag_name.substring(1), curVer)) {
	                	log.info("The application has found a newer version available as a release on Github corresponding to version " + githubData.tag_name.substring(1) + ".");
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
	}).catch(err => {
		log.warn("The app failed to check for an update because it could not connect to the internet. More specifically, connecting to https://google.com failed at the address " + err.address + ":" + err.port + " with exit code " + err.code + ".");
	});
};



module.exports = exports;