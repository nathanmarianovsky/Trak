/*

BASIC DETAILS: Provides all actions associated to working with book records.

   - bookObjCreation: Creates an object associated to a book record in order to save/update.
   - bookSave: Handles the saving of a book record by creating the associated folders and data file.
   - bookUpdate: Handles the update of a book record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



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
      "img": tools.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + providedData[3] + "-" + providedData[1].replace(/[/\\?%*:|"<>]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), providedData[15])
   };
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
      tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "A", dataPath, fs, path, evnt, data);
   }
   else {
      log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[3]) + " already exists!");
      evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[3]));
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
            tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
         }
      });
   }
   else {
      // Write the data file, and copy over the file assets.
      tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.bookObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
   }
};



module.exports = exports;