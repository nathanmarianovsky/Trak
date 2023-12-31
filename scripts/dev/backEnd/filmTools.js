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
   - imdbScraper provides the means to attain film records from imdb.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of strings corresponding to the previous and current queries used for a search.

*/
exports.filmSearch = (log, imdbScraper, ev, search) => {
    // Use the imdb scraper to fetch film listings possibly matching what the user is looking for.
    imdbScraper.simpleSearch(search[1]).then(data => {
        log.info("imdb-scrapper has finished getting the search results for the query " + search[1] + ".");
        // Send the attained data to the front-end.
        ev.sender.send("filmSearchResults", [search[0], search[1], data.d.filter(elem => elem.qid == "movie").map(elem => [elem.l, elem.i[0]])]);
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
        const runtimeArr = filmData.runtime.title.split(" ");
        // Send the attained data to the front-end.
        ev.sender.send("filmFetchDetailsResult", [
            filmData.name, filmData.otherNames.join(", "), [filmData.posterImage.url, filmData.allImages.map(elem => elem.url)], String(filmData.dates.startDate),
            (parseInt(runtimeArr[0]) * 60) + parseInt(runtimeArr[runtimeArr.length - 2]), filmData.genres.map(gen => gen.charAt(0).toUpperCase() + gen.substring(1)),
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
            // console.log(results);
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
            // Once all anime results have an associated picture send the list of anime releases to the front-end.
            detPromise.then(() => {
                // console.log(resultsArr);
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



// /*

// Handles the fetching of a synopsis associated to an anime record from myanimelist.

//    - log provides the means to create application logs to keep track of what is going on.
//    - malScraper provides the means to attain anime and manga records from myanimelist.
//    - ev provides the means to interact with the front-end of the Electron app.
//    - link is a string representing the URL of an anime record on myanimelist.

// */
// exports.animeSynopsisFetch = (log, malScraper, ev, link) => {
//     // Fetch the anime details based on the URL.
//     malScraper.getInfoFromURL(link).then(data => {
//         // Provide the anime synopsis to the front-end.
//         ev.sender.send("animeSynopsisFetchResult", data.synopsis);
//     }).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
// };



// /*

// Provides the front-end with anime details associated to an item clicked in the anime content search.

//    - BrowserWindow and ipc provide the means to operate the Electron app.
//    - path and fs provide the means to work with local files.
//    - log provides the means to create application logs to keep track of what is going on.
//    - https provides the means to download files.
//    - malScraper provides the means to attain anime and manga records from myanimelist.
//    - tools provides a collection of local functions.
//    - globalWin is an object representing the primary window of the Electron app.
//    - win is an object representing the addRecord window of the Electron app.
//    - usrDataPath is the current path to the local user data.
//    - link is a string representing the URL of an anime record on myanimelist.

// */
// exports.animeRecordRequest = (BrowserWindow, ipc, path, fs, log, https, malScraper, tools, globalWin, win, usrDataPath, link) => {
//     // Fetch anime details.
//     malScraper.getInfoFromURL(link).then(animeData => {
//         // Define the parameters which will be passed to the front-end based on the details received.
//         let startDate = "",
//             endDate = "";
//         const directorsArr = [],
//             producersArr = [],
//             writersArr = [],
//             musicArr = [];
//         // Properly define the start and end date of an anime listing on myanimelist.
//         if(animeData.aired != undefined) {
//             let splitArr = animeData.aired.split("to");
//             startDate = splitArr[0];
//             if(splitArr.length > 1) {
//                 endDate = splitArr[1];
//             }
//         }
//         // Properly define the lists of directors, producers, writers, and music directors associated to the anime listing on myanimelist.
//         animeData.staff.forEach(person => {
//             person.role.split(", ").forEach(personRole => {
//                 if(personRole.toLowerCase().includes("director") && !personRole.toLowerCase().includes("sound")) {
//                     directorsArr.push(person.name.split(", ").reverse().join(" "));
//                 }
//                 if(personRole.toLowerCase().includes("producer")) {
//                     producersArr.push(person.name.split(", ").reverse().join(" "));
//                 }
//                 if(personRole.toLowerCase().includes("storyboard")) {
//                     writersArr.push(person.name.split(", ").reverse().join(" "));
//                 }
//                 if(personRole.toLowerCase().includes("sound") || person.role.toLowerCase().includes("music")) {
//                     musicArr.push(person.name.split(", ").reverse().join(" "));
//                 }
//             });
//         });
//         win.webContents.send("animeFetchDetailsResultName", animeData.title);
//         // Fetch all possible images associated to the anime record.
//         malScraper.getPictures({ "name": animeData.title, "id": animeData.id }).then(malImgArr => {
//             // Send the attained data to the front-end.
//             log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + animeData.title + ".");
//             let allImgArr = malImgArr.map(pic => pic.imageLink);
//             tools.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0);
//             win.webContents.send("animeFetchDetailsResult", [
//                 animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, allImgArr], startDate, endDate,
//                 animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
//                 animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
//             ]);
//             ipc.once("performSave", (event, submission) => {
//                 // Save the corresponding data.
//                 exports.animeSave(BrowserWindow, path, fs, log, https, tools, globalWin, usrDataPath, event, submission);
//             });
//         }).catch(err => log.error("There was an issue getting the pictures associated to the anime " + animeData.title + "."));
//     }).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
// };



module.exports = exports;