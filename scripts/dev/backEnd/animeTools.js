/*

BASIC DETAILS: Provides all actions associated to working with anime records.

   - animeObjCreation: Creates an object associated to an anime record in order to save/update.
   - animeSave: Handles the saving of an anime record by creating the associated folders and data file.
   - animeUpdate: Handles the update of an anime record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



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
      "img": tools.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + (providedData[1] != "" ? providedData[1] : providedData[2]).replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), providedData[14]),
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
      tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "A", dataPath, fs, path, evnt, data);
   }
   else {
      log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[2]) + " already exists!");
      evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[2]));
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
            tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
         }
      });
   }
   else {
      // Write the data file, and copy over the file assets.
      tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.animeObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
   }
};



module.exports = exports;