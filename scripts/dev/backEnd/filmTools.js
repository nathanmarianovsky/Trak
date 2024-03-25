/*

BASIC DETAILS: Provides all actions associated to working with film records.

   - filmObjCreation: Creates an object associated to a film record in order to save/update.
   - filmSave: Handles the saving of a film record by creating the associated folders and data file.
   - filmUpdate: Handles the update of a film record.
   - filmSearch: Handles the search of imdb film records based on a query.
   - filmFetchDetails: Handles the fetching of a film record from imdb based on a name.
   - filmFetchSeason: Handles the fetching of records for a film season from imdb.
   - filmFetchSearch: Handles the search of imdb film records based on a query in order to provide a film content search.
   - filmSynopsisFetch: Handles the fetching of a synopsis associated to a film record from imdb.
   - filmRecordRequest: Provides the front-end with film details associated to an item clicked in the film content search.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Creates an object associated to a film record in order to save/update.

   - path and fs provide the means to work with local files.
   - https provides the means to download files.
   - tools provides a collection of local functions.
   - dir is the path to the local user data.
   - providedData is the data provided by the front-end user submission for anime record save/update.

*/
exports.filmObjCreation = (path, fs, https, tools, dir, providedData) => {
    return {
        "category": providedData[0],
        "name": providedData[1],
        "alternateName": providedData[2],
        "review": providedData[3],
        "directors": providedData[4],
        "producers": providedData[5],
        "writers": providedData[6],
        "musicians": providedData[7],
        "editors": providedData[8],
        "cinematographers": providedData[9],
        "distributors": providedData[11],
        "productionCompanies": providedData[12],
        "stars": providedData[13],
        "genres": providedData[14],
        "synopsis": providedData[15],
        "rating": providedData[16],
        "release": providedData[17],
        "runTime": providedData[18],
        "watched": providedData[19],
        "img": tools.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + tools.formatFolderName(providedData[1]), providedData[20])
    };
};



/*

Handles the saving of a film record by creating the associated folders and data file.

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
exports.filmSave = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
    // Check to see that the folder associated to the new record does not exist.
    if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1])))) {
        // Create a new directory for the assets associated to the new record.
        const assetsPath = path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1]), "assets");
        log.info("Creating the assets directory for the new film record. To be located at " + assetsPath);
        fs.mkdirSync(assetsPath, { "recursive": true });
        tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.filmObjCreation(path, fs, https, tools, dataPath, data), "A", dataPath, fs, path, evnt, data);
    }
    else {
        log.warn("A record for the " + data[0].toLowerCase() + " " + data[1] + " already exists!");
        evnt.sender.send("recordExists", data[0] + "-" + data[1]);
    }
};



/*

Handles the update of a film record.

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
exports.filmUpdate = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
    // If the name has been updated then change the associated record folder name.
    if(data[1] != "" && data[1] != data[data.length - 1]) {
        fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[data.length - 1])), path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1])), err => {
            // If there was an error in renaming the record folder notify the user.
            if(err) {
                log.error("There was an error in renaming the film record folder " + data[data.length - 1] + " to " + data[1] + ".");
                evnt.sender.send("recordFolderRenameFailure", [data[data.length - 1], data[1]]);
            }
            // If no error occured in renaming the record folder write the data file, and copy over the file assets.
            else {
                tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.filmObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
            }
        });
    }
    else {
        // Write the data file, and copy over the file assets.
        tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), exports.filmObjCreation(path, fs, https, tools, dataPath, data), "U", dataPath, fs, path, evnt, data);
    }
};



/*

Handles the search of imdb film records based on a query.

   - log provides the means to create application logs to keep track of what is going on.
   - movier provides the means to attain film records from imdb.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of strings corresponding to the previous and current queries used for a search.

*/
exports.filmSearch = (log, movier, ev, search) => {
    // Use the imdb scraper to fetch film listings possibly matching what the user is looking for.
    movier.searchTitleByName(search[1]).then(data => {
        log.info("movier has finished getting the search results for the query " + search[1] + ".");
        // Send the attained data to the front-end.
        ev.sender.send("filmSearchResults", [search[0], search[1], data.filter(elem => elem.titleType == "movie").map(elem => [elem.name, elem.thumbnailImageUrl])]);
    }).catch(err => log.error("There was an issue in obtaining the film search results for autocomplete options associated to the query " + search[1] + "."));
};



/*

Handles the fetching of a film record from imdb based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - movier provides the means to attain film records from imdb.
   - tools provides a collection of local functions.
   - ev provides the means to interact with the front-end of the Electron app.
   - name is a string representing the title of a film record.

*/
exports.filmFetchDetails = (log, movier, tools, ev, name) => {
    // Fetch film details.
    movier.getTitleDetailsByName(name).then(filmData => {
        log.info("Movier has finished getting the details associated to the film " + name + ".");
        const runtimeNum = parseInt(filmData.runtime.seconds / 60);
        // Send the attained data to the front-end.
        ev.sender.send("filmFetchDetailsResult", [
            filmData.name, filmData.otherNames.join(", "), [filmData.posterImage.url, filmData.allImages.slice(0, 10).map(elem => elem.url)],
            String(filmData.dates.startDate), runtimeNum, filmData.genres.map(gen => gen.charAt(0).toUpperCase() + gen.substring(1)),
            filmData.directors.map(director => director.name), filmData.writers.map(director => director.name),
            filmData.productionCompanies.filter(elem => elem.extraInfo.toLowerCase().includes("distributor")).map(elem => elem.name), filmData.producers.map(producers => producers.name),
            filmData.productionCompanies.filter(elem => elem.extraInfo.toLowerCase().includes("production")).map(elem => elem.name), filmData.casts.map(star => star.name), filmData.plot
        ]);
    }).catch(err => log.error("There was an issue in obtaining the details associated to the film name " + name + "."));
};



/*

Handles the search of imdb film records based on a query in order to provide a film content search.

   - log provides the means to create application logs to keep track of what is going on.
   - movier provides the means to attain film records from imdb.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of a string corresponding to the query used for a search and a page number.
   - path provides the means to work with local files.

*/
exports.filmFetchSearch = (log, movier, ev, search, path) => {
    if(search[1] == 1) {
        // Fetch the search results.
        log.info("Searching for film records based on the query " + search[0] + ".");
        movier.searchTitleByName(search[0]).then(results => {
            results = results.filter(elem => elem.titleType == "movie");
            const resultsArr = [];
            // Define a promise which will resolve only once all details have been attained for each search result.
            const detPromise = new Promise((resolve, reject) => {
                // Iterate through the search results.
                results.forEach(elem => {
                    // Fetch the film details based on the URL.
                    movier.getTitleDetailsByUrl(elem.url).then(elemData => {
                        elemData.genres = elemData.genres.map(str => {
                            if(str == "Post-Apocalyptic") {
                                str = "PostApocalyptic";
                            }
                            else if(str == "Sci-Fi") {
                                str = "SciFi";
                            }
                            return str;
                        });
                        // Push the film details into the overall collection.
                        resultsArr.push([elem.name, (elem.thumbnailImageUrl != "" ? elem.thumbnailImageUrl.split("V1_")[0] + "V1_" + path.extname(elem.thumbnailImageUrl) : elemData.posterImage.url), elem.url, (elemData.mainRate.votesCount != 0 ? elemData.mainRate.rate : "N/A"), elemData.genres]);
                        if(resultsArr.length == results.length) { resolve(); }
                    }).catch(err => {
                        log.error("There was an issue getting the film details based on the url " + elem.url + ".");
                        resultsArr.push([elem.name, elem.thumbnailImageUrl.split("V1_")[0] + "V1_" + path.extname(elem.thumbnailImageUrl), elem.url, "N/A", []]);
                        if(resultsArr.length == results.length) { resolve(); }
                    });
                })
            });
            // Once all film results have an associated picture send the list of film releases to the front-end.
            detPromise.then(() => {
                ev.sender.send("fetchResult", [resultsArr, false, "Film", search[1] == 1]);
            }).catch(err => log.error("There was an issue resolving the promise associated to grabbing film details based on the search query " + search[0] + "."));
        }).catch(err => {
            log.warn("There was an issue obtaining the film releases based on the query " + search[0] + ". Returning an empty collection.");
            ev.sender.send("fetchResult", [[], false, "Film", search[1] == 1]);
        });
    }
    else {
        ev.sender.send("fetchResult", [[], false, "Film", false]);
    }
};



/*

Handles the fetching of a synopsis associated to a film record from imdb.

   - log provides the means to create application logs to keep track of what is going on.
   - movier provides the means to attain film records from imdb.
   - ev provides the means to interact with the front-end of the Electron app.
   - link is a string representing the URL of a film record on imdb.

*/
exports.filmSynopsisFetch = (log, movier, ev, link) => {
    // Fetch the film details based on the URL.
    movier.getTitleDetailsByUrl(link).then(data => {
        // Provide the film synopsis to the front-end.
        ev.sender.send("filmSynopsisFetchResult", data.plot);
    }).catch(err => log.error("There was an issue getting the film synopsis based on the url " + link + "."));
};



/*

Provides the front-end with film details associated to an item clicked in the film content search.

   - BrowserWindow and ipc provide the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - movier provides the means to attain film records from imdb.
   - tools provides a collection of local functions.
   - globalWin is an object representing the primary window of the Electron app.
   - win is an object representing the addRecord window of the Electron app.
   - usrDataPath is the current path to the local user data.
   - link is a string representing the URL of a film record on imdb.

*/
exports.filmRecordRequest = (BrowserWindow, ipc, path, fs, log, https, movier, tools, globalWin, win, usrDataPath, link) => {
    // Fetch film details.
    movier.getTitleDetailsByUrl(link).then(filmData => {
        log.info("Movier has finished getting the details associated to the film " + filmData.name + ".");
        const runtimeArr = filmData.runtime.title.split(" ");
        // Send the attained data to the front-end.
        win.webContents.send("filmFetchDetailsResult", [
            filmData.name, filmData.otherNames.join(", "), [filmData.posterImage.url, filmData.allImages.slice(0, 10).map(elem => elem.url)], String(filmData.dates.startDate),
            (parseInt(runtimeArr[0]) * 60) + parseInt(runtimeArr[runtimeArr.length - 2]), filmData.genres.map(gen => gen.charAt(0).toUpperCase() + gen.substring(1)),
            filmData.directors.map(director => director.name), filmData.writers.map(director => director.name),
            filmData.productionCompanies.filter(elem => elem.extraInfo.toLowerCase().includes("distributor")).map(elem => elem.name), filmData.producers.map(producers => producers.name),
            filmData.productionCompanies.filter(elem => elem.extraInfo.toLowerCase().includes("production")).map(elem => elem.name), filmData.casts.map(star => star.name), filmData.plot
        ]);
        ipc.once("performSave", (event, submission) => {
            // Save the corresponding data.
            exports.filmSave(BrowserWindow, path, fs, log, https, tools, globalWin, usrDataPath, event, submission);
        });
    }).catch(err => log.error("There was an issue getting the film details based on the url " + link + "."));
};



module.exports = exports;