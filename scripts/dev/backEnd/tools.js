/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - exportDataZIP: Create a zip file containing the exported library records.
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



exports.calculateReleaseDate = contentArr => {
	let candidate = "";
	for(let z = 0; z < contentArr.length; z++) {
		let candidateHolder = "";
		if((contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release) != "") {
			candidateHolder = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
		}
		if(candidate == "" && candidateHolder != "") {
			candidate = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
		}
		else if(candidate != "" && candidateHolder != "") {
			if(candidateHolder < candidate) {
				candidate = new Date(contentArr[z].scenario == "Season" ? contentArr[z].start : contentArr[z].release);
			}
		}
	}
	return candidate != "" ? candidate.toJSON().split("T")[0] : "N/A";
};



exports.calculateGlobalRating = contentArr => {
	let overallSum = 0,
		overallCount = 0;
	for(let r = 0; r < contentArr.length; r++) {
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
		else if(contentArr[r].scenario == "Single" && contentArr[r].rating != "") {
			overallSum += parseInt(contentArr[r].rating);
			overallCount++;
		}
	}
	return overallCount != 0 ? String((overallSum / overallCount).toFixed(2)) : "N/A";
};



// /*

// Create a csv file containing the exported library records.

// 	- fs and path provide the means to work with local files.
	// - zipper is a library object which can create zip files.
// 	- ExcelJS provides the means to export/import csv files.
// 	- eve is the object which allows for interaction with the fron-end of the Electron application.
// 	- dir is a string representing the base directory corresponding to the location of the configuration file.
// 	- exportLocation is a string representing the location where the generated zip file will be placed.

// */ 
exports.exportDataCSV = (fs, path, zipper, ExcelJS, eve, dir, exportLocation, records, detailed = false) => {
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
				dataPath = fileData.current != undefined ? fileData.current.path : fileData.original.path,
				workbook = new ExcelJS.Workbook();
			workbook.creator = "Trak";
			workbook.created = new Date();
			const animeWorksheet = workbook.addWorksheet("Category-Anime");
			animeWorksheet.views = [{"state": "frozen", "xSplit": 1, "ySplit": 1, "activeCell": "A2"}];
			animeWorksheet.getRow(1).height = 20;
			animeWorksheet.getRow(1).alignment = { "vertical": "middle", "horizontal": "center" };
			animeWorksheet.getRow(1).border = {
				"top": { "style": "thin" },
				"left": { "style": "thin" },
				"bottom": { "style": "thin" },
				"right": { "style": "thin" }
			};
			animeWorksheet.getRow(1).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
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
			for(let x = 0; x < records.length; x++) {
				animeWorksheet.getRow(x + 2).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
				animeWorksheet.getRow(x + 2).height = 75;
				let iterData = JSON.parse(fs.readFileSync(path.join(dataPath, records[x], "data.json"), "UTF8"));
				if(iterData.category == "Anime") {
					animeWorksheet.getCell("A" + (x + 2)).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true, "underline": true, "color": { "argb": "FF0000FF" } };
					animeWorksheet.getCell("A" + (x + 2)).border = {
						"top": { "style": "thin" },
						"left": { "style": "thin" },
						"bottom": { "style": "thin" },
						"right": { "style": "thin" }
					};
					animeWorksheet.getCell("A" + (x + 2)).value = iterData.name;
					animeWorksheet.getCell("B" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("B" + (x + 2)).value = iterData.jname != "" ? iterData.jname : "N/A";
					animeWorksheet.getCell("C" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("C" + (x + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					animeWorksheet.getCell("C" + (x + 2)).value = exports.calculateGlobalRating(iterData.content);
					animeWorksheet.getCell("D" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("D" + (x + 2)).value = iterData.review != "" ? iterData.review : "N/A";
					animeWorksheet.getCell("E" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("E" + (x + 2)).value = iterData.synopsis != "" ? iterData.synopsis : "N/A";
					animeWorksheet.getCell("F" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("F" + (x + 2)).value = iterData.directors != "" ? iterData.directors : "N/A";
					animeWorksheet.getCell("G" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("G" + (x + 2)).value = iterData.producers != "" ? iterData.producers : "N/A";
					animeWorksheet.getCell("H" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("H" + (x + 2)).value = iterData.writers != "" ? iterData.writers : "N/A";
					animeWorksheet.getCell("I" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("I" + (x + 2)).value = iterData.musicians != "" ? iterData.musicians : "N/A";
					animeWorksheet.getCell("J" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("J" + (x + 2)).value = iterData.studio != "" ? iterData.studio : "N/A";
					animeWorksheet.getCell("K" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("K" + (x + 2)).value = iterData.license != "" ? iterData.license : "N/A";
					animeWorksheet.getCell("L" + (x + 2)).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
					animeWorksheet.getCell("L" + (x + 2)).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
					let dateArr = exports.calculateReleaseDate(iterData.content).split("-");
					animeWorksheet.getCell("L" + (x + 2)).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
					let filterGenreStr = "";
					for(let f = 0; f < iterData.genres[0].length; f++) {
						if(iterData.genres[1][f] == true) {
							if(filterGenreStr.length > 0) {
								filterGenreStr += ", "
							}
				            if(iterData.genres[0][f] == "CGDCT") {
				                filterGenreStr += "CGDCT";
				            }
				            else if(iterData.genres[0][f] == "ComingOfAge") {
				                filterGenreStr += "Coming-of-Age";
				            }
				            else if(iterData.genres[0][f] == "PostApocalyptic") {
				                filterGenreStr += "Post-Apocalyptic";
				            }
				            else if(iterData.genres[0][f] == "SciFi") {
				                filterGenreStr += "Sci-Fi";
				            }
				            else if(iterData.genres[0][f] == "SliceOfLife") {
				                filterGenreStr += "Slice of Life";
				            }
				            else {
				                filterGenreStr += iterData.genres[0][f].split(/(?=[A-Z])/).join(" ");
				            }
						}
					}
					if(filterGenreStr == "") { filterGenreStr = "N/A"; }
					animeWorksheet.getCell("M" + (x + 2)).value = filterGenreStr;
					if(detailed == true) {
						let detailedWorksheet = workbook.addWorksheet("Anime-" + iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""));
						detailedWorksheet.views = [{"state": "frozen", "ySplit": 1, "activeCell": "A2"}];
						detailedWorksheet.getRow(1).height = 20;
						detailedWorksheet.getRow(1).alignment = { "vertical": "middle", "horizontal": "center" };
						detailedWorksheet.getRow(1).border = {
							"top": { "style": "thin" },
							"left": { "style": "thin" },
							"bottom": { "style": "thin" },
							"right": { "style": "thin" }
						};
						detailedWorksheet.getRow(1).font = { "size": 12, "name": "Arial", "family": 2, "scheme": "minor", "bold": true };
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
						let rowPos = 2;
						for(let v = 0; v < iterData.content.length; v++) {
							if(iterData.content[v].scenario == "Season") {
								for(let t = 0; t < iterData.content[v].episodes.length; t++) {
									detailedWorksheet.getRow(rowPos).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
									detailedWorksheet.getRow(rowPos).height = 75;
									detailedWorksheet.getCell("A" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("A" + rowPos).value = "Season";
									detailedWorksheet.getCell("B" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
									detailedWorksheet.getCell("C" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("C" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].start.split("-");
									detailedWorksheet.getCell("C" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("D" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("D" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].end.split("-");
									detailedWorksheet.getCell("D" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("E" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("E" + rowPos).value = iterData.content[v].status != "" ? iterData.content[v].status : "N/A";
									detailedWorksheet.getCell("F" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("F" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
									dateArr = iterData.content[v].episodes[t].watched.split("-");
									detailedWorksheet.getCell("F" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
									detailedWorksheet.getCell("G" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("G" + rowPos).alignment = { "vertical": "middle", "horizontal": "center" };
									detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].episodes[t].rating != "" ? iterData.content[v].episodes[t].rating : "N/A";
									detailedWorksheet.getCell("H" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									let maxCharCount = String(iterData.content[v].episodes.length).length;
									detailedWorksheet.getCell("H" + rowPos).value = String(t + 1).length < maxCharCount ? new Array(maxCharCount - String(t + 1).length).fill("0").join("") + (t + 1) : t + 1;
									detailedWorksheet.getCell("I" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].episodes[t].name != "" ? iterData.content[v].episodes[t].name : "N/A";
									detailedWorksheet.getCell("J" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
									detailedWorksheet.getCell("J" + rowPos).value = iterData.content[v].episodes[t].review != "" ? iterData.content[v].episodes[t].review : "N/A";
									rowPos++;
								}
							}
							else if(iterData.content[v].scenario == "Single") {
								detailedWorksheet.getRow(rowPos).alignment = { "vertical": "middle", "horizontal": "left", "wrapText": true };
								detailedWorksheet.getRow(rowPos).height = 75;
								detailedWorksheet.getCell("A" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("A" + rowPos).value = iterData.content[v].type != "" ? iterData.content[v].type : "Single";
								detailedWorksheet.getCell("B" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("B" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								detailedWorksheet.getCell("C" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("C" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								dateArr = iterData.content[v].release.split("-");
								detailedWorksheet.getCell("C" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("D" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("D" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								detailedWorksheet.getCell("D" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("E" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("E" + rowPos).value = "N/A";
								detailedWorksheet.getCell("F" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("F" + rowPos).alignment = { "vertical": "middle", "horizontal": "center", "wrapText": true };
								dateArr = iterData.content[v].watched.split("-");
								detailedWorksheet.getCell("F" + rowPos).value = dateArr.length == 3 ? dateArr[1] + "-" + dateArr[2] + "-" + dateArr[0] : "N/A";
								detailedWorksheet.getCell("G" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("G" + rowPos).alignment = { "vertical": "middle", "horizontal": "center" };
								detailedWorksheet.getCell("G" + rowPos).value = iterData.content[v].rating != "" ? iterData.content[v].rating : "N/A";
								detailedWorksheet.getCell("H" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("H" + rowPos).value = "1";
								detailedWorksheet.getCell("I" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("I" + rowPos).value = iterData.content[v].name != "" ? iterData.content[v].name : "N/A";
								detailedWorksheet.getCell("J" + rowPos).font = { "size": 10, "name": "Arial", "family": 2, "scheme": "minor", "bold": false };
								detailedWorksheet.getCell("J" + rowPos).value = iterData.content[v].review != "" ? iterData.content[v].review : "N/A";
								rowPos++;
							}
						}
						animeWorksheet.getCell("A" + (x + 2)).value = { hyperlink: "#\'Anime-" + iterData.name.split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("") + "\'!A2", text: iterData.name }
					}
				}
			}
			if(!fs.existsSync(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, "."))))) {
				fs.mkdirSync(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, "."))));
			}
			workbook.xlsx.writeFile(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")), "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")) + ".xlsx")).then(() => console.log("done xlsx"));
			// workbook.csv.writeFile(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")) + ".csv")).then(() => console.log("done csv"));

			// Copy over all library records which will be included in the export.
			let listPromise = new Promise((resolve, reject) => {
			    records.forEach((elem, index, arr) => {
					fs.copySync(path.join(dataPath, elem, "assets"), path.join(dir, "Trak", "exportTemp", elem, "assets"), { "overwrite": true });
					if(index == arr.length - 1) { resolve(); }
				});
			});
			// Once all necessary records have copied over, zip the assets.
			listPromise.then(() => {
				zipper.zip(path.join(dir, "Trak", "exportTemp"), (prob, zipped) => {
					// If there was an issue creating the zip file notify the user.
					if(prob) { eve.sender.send("exportZippingFailure"); }
					else {
						// Define the zip file name.
						let zipStr = "Trak-Export-";
						// // Compress the zip file if requested.
						// if(compressionVal == true) {
						// 	zipStr += "Compressed-";
						// 	zipped.compress();
						// }
						zipStr += (new Date().toJSON().slice(0, 10).replace(/-/g, ".")) + ".zip";
						// Delete a previous export if it exists for the current day.
						let deletePromise = new Promise((resolve, reject) => {
							if(fs.existsSync(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")), zipStr))) {
								fs.unlink(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")), zipStr), delErr => {
									if(delErr) { eve.sender.send("exportZipFileDeleteFailure"); }
									else { resolve(); }
								});
							}
							else { resolve(); }
						});
						// Save the zip file, empty the exportTemp folder, and notify the user that the export process has finished.
						deletePromise.then(() => {
							zipped.save(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")), zipStr), zipErr => {
								if(zipErr) { eve.sender.send("exportZipFileFailure"); }
								else {
									fs.emptyDirSync(path.join(dir, "Trak", "exportTemp"));
									// eve.sender.send("exportZipFileSuccess", exportLocation);
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

Create a zip file containing the exported library records.

	- fs and path provide the means to work with local files.
	- zipper is a library object which can create zip files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- exportLocation is a string representing the location where the generated zip file will be placed.
	- records is the list of items which the user desires to export.
	- compressionVal is a boolean representing whether the zip file should be compressed.

*/ 
exports.exportDataZIP = (fs, path, zipper, eve, dir, exportLocation, records, compressionVal = false) => {
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
exports.importDataZIP = async (fs, path, ipc, zipper, win, eve, dir, zipFile) => {
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
    	await exports.importDataZIP(fs, path, ipc, zipper, mainWin, evnt, ogPath, lst[i]);
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