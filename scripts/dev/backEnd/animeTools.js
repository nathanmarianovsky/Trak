/*

BASIC DETAILS: Provides all actions associated to working with anime records.

   - animeObjCreation: Creates an object associated to an anime record in order to save/update.
   - animeSave: Handles the saving of an anime record by creating the associated folders and data file.
   - animeUpdate: Handles the update of an anime record.
   - animeSearch: Handles the search of myanimelist anime records based on a query.
   - animeFetchDetails: Handles the fetching of an anime record from myanimelist based on a name.
   - animeFetchSeason: Handles the fetching of records for an anime season from myanimelist.
   - animeFetchSearch: Handles the search of myanimelist anime records based on a query in order to provide an anime content search.
   - animeSynopsisFetch: Handles the fetching of a synopsis associated to an anime record from myanimelist.
   - animeRecordRequest: Provides the front-end with anime details associated to an item clicked in the anime content search.

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
        "img": tools.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + tools.formatFolderName(providedData[1] != "" ? providedData[1] : providedData[2]), providedData[14]),
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
exports.animeAdd = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data) => {
    // Check to see that the folder associated to the new record does not exist.
    if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1]))) && !fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[2])))) {
        // Create a new directory for the assets associated to the new record.
        const assetsPath = path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1] != "" ? data[1] : data[2]), "assets");
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
        fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[data.length - 1])), path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1] != "" ? data[1] : data[2])), err => {
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



/*

Handles the search of myanimelist anime records based on a query.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of strings corresponding to the previous and current queries used for a search.

*/
exports.animeSearch = (log, malScraper, ev, search) => {
    // Use the MAL scraper to fetch anime listings possibly matching what the user is looking for.
    malScraper.getResultsFromSearch(search[1], "anime").then(data => {
        log.info("MyAnimeList-Scraper has finished getting the search results for the query " + search[1] + ".");
        // Send the attained data to the front-end.
        ev.sender.send("animeSearchResults", [search[0], search[1], data.map(elem => [elem.name, elem.image_url])]);
    }).catch(err => log.error("There was an issue in obtaining the anime search results for autocomplete options associated to the query " + search[1] + "."));
};



/*

Handles the fetching of an anime record from myanimelist based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - tools provides a collection of local functions.
   - ev provides the means to interact with the front-end of the Electron app.
   - name is a string representing the title of an anime record.

*/
exports.animeFetchDetails = (log, malScraper, tools, ev, name) => {
    // Fetch anime details.
    malScraper.getInfoFromName(name, true, "anime").then(animeData => {
        // Define the parameters which will be passed to the front-end based on the details received.
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
            if(splitArr.length > 1) {
                endDate = splitArr[1];
            }
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
        // Fetch all possible images associated to the anime record.
        malScraper.getPictures({ "name": animeData.title, "id": animeData.id }).then(malImgArr => {
            // Send the attained data to the front-end.
            log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + name + ".");
            let allImgArr = malImgArr.map(pic => pic.imageLink);
            allImgArr.indexOf(animeData.picture) != -1 ? tools.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0) : allImgArr = [animeData.picture].concat(allImgArr);
            ev.sender.send("animeFetchDetailsResult", [
                animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, allImgArr], startDate, endDate,
                animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
                animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
            ]);
        }).catch(err => {
            log.error("There was an issue in obtaining the pictures associated to the anime record " + name + ".");
            ev.sender.send("animeFetchDetailsResult", [
                animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, [animeData.picture]], startDate, endDate,
                animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
                animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
            ]);
        });
    }).catch(err => log.error("There was an issue in obtaining the details associated to the anime name " + name + "."));
};



/*

Handles the fetching of records for an anime season from myanimelist.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - seasonInfo is an array containing the year, season, and an array of anime release types.

*/
exports.animeFetchSeason = (log, malScraper, ev, seasonInfo) => {
    // Fetch the season releases.
    malScraper.getSeason(seasonInfo[0], seasonInfo[1]).then(data => {
        let seasonContent = [];
        // If a user does not choose a filter then show all types of releases by default.
        if(seasonInfo[2].length == 0) {
            const attributes = ["TV", "OVAs", "ONAs", "Movies", "Specials"];
            for(let a = 0; a < attributes.length; a++) {
                seasonContent = seasonContent.concat(data[attributes[a]]);
            }
        }
        // Otherwise only add the releases which adhere to the filters set by the user.
        else {
            for(let a = 0; a < seasonInfo[2].length; a++) {
                seasonContent = seasonContent.concat(data[seasonInfo[2][a]]);
            }
        }
        seasonContent.forEach(item => {
            item.genres = item.genres[0].split("\n").map(str => {
                str = str.trim();
                if(str == "Coming-of-Age") {
                    str = "ComingOfAge";
                }
                else if(str == "Post-Apocalyptic") {
                    str = "PostApocalyptic";
                }
                else if(str == "Sci-Fi") {
                    str = "SciFi";
                }
                else if(str == "Slice of Life") {
                    str = "SliceOfLife";
                }
                return str;
            }).filter(str => str != "");
        });
        // Send the list of anime releases for the season to the front-end.
        ev.sender.send("fetchResult", [seasonContent.map(elem => [elem.title, elem.picture, elem.link, elem.score, elem.genres]), true, "Anime"]);
    }).catch(err => log.error("There was an issue in obtaining the releases for the anime season " + seasonInfo[0] + " " + seasonInfo[1].charAt(0).toUpperCase() + seasonInfo[1].slice(1) + "."));
};



/*

Handles the search of myanimelist anime records based on a query in order to provide an anime content search.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of a string corresponding to the query used for a search and a page number.

*/
exports.animeFetchSearch = (log, malScraper, ev, search) => {
    // Fetch the search results.
    log.info("Searching for anime records based on the query " + search[0] + ".");
    malScraper.search.search("anime", { "term": search[0], "has": (search[1] - 1) * 50 }).then(results => {
        const resultsArr = [];
        // Define a promise which will resolve only once a picture has been attained for each search result.
        const picPromise = new Promise((resolve, reject) => {
            // Iterate through the search results.
            results.forEach(elem => {
                // Fetch the anime details based on the URL.
                malScraper.getInfoFromURL(elem.url).then(elemData => {
                    elemData.genres = elemData.genres.map(str => {
                        if(str == "Coming-of-Age") {
                        str = "ComingOfAge";
                    }
                    else if(str == "Post-Apocalyptic") {
                        str = "PostApocalyptic";
                    }
                    else if(str == "Sci-Fi") {
                        str = "SciFi";
                    }
                    else if(str == "Slice of Life") {
                        str = "SliceOfLife";
                    }
                    return str;
                    });
                    // Push the anime details into the overall collection.
                    resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, elemData.genres]);
                    if(resultsArr.length == results.length) { resolve(); }
                }).catch(err => {
                    log.error("There was an issue getting the anime details based on the url " + elem.url + ".");
                    resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, []]);
                    if(resultsArr.length == results.length) { resolve(); }
                });
            })
        });
        // Once all anime results have an associated picture send the list of anime releases to the front-end.
        picPromise.then(() => {
            ev.sender.send("fetchResult", [resultsArr, false, "Anime", search[1] == 1]);
        }).catch(err => log.error("There was an issue resolving the promise associated to grabbing anime release pictures based on the search query " + search[0] + "."));
    }).catch(err => {
        log.warn("There was an issue obtaining the anime releases based on the query " + search[0] + ". Returning an empty collection.");
        ev.sender.send("fetchResult", [[], false, "Anime", search[1] == 1]);
    });
};



/*

Handles the fetching of a synopsis associated to an anime record from myanimelist.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - link is a string representing the URL of an anime record on myanimelist.

*/
exports.animeSynopsisFetch = (log, malScraper, ev, link) => {
    // Fetch the anime details based on the URL.
    malScraper.getInfoFromURL(link).then(data => {
        // Provide the anime synopsis to the front-end.
        ev.sender.send("animeSynopsisFetchResult", data.synopsis);
    }).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
};



/*

Provides the front-end with anime details associated to an item clicked in the anime content search.

   - BrowserWindow and ipc provide the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - tools provides a collection of local functions.
   - globalWin is an object representing the primary window of the Electron app.
   - win is an object representing the addRecord window of the Electron app.
   - usrDataPath is the current path to the local user data.
   - link is a string representing the URL of an anime record on myanimelist.

*/
exports.animeRecordRequest = (BrowserWindow, ipc, path, fs, log, https, malScraper, tools, globalWin, win, usrDataPath, link) => {
    // Fetch anime details.
    malScraper.getInfoFromURL(link).then(animeData => {
        // Define the parameters which will be passed to the front-end based on the details received.
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
            if(splitArr.length > 1) {
                endDate = splitArr[1];
            }
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
        win.webContents.send("animeFetchDetailsResultName", animeData.title);
        // Fetch all possible images associated to the anime record.
        malScraper.getPictures({ "name": animeData.title, "id": animeData.id }).then(malImgArr => {
            // Send the attained data to the front-end.
            log.info("MyAnimeList-Scraper has finished getting the details associated to the anime " + animeData.title + ".");
            let allImgArr = malImgArr.map(pic => pic.imageLink);
            tools.arrayMove(allImgArr, allImgArr.indexOf(animeData.picture), 0);
            win.webContents.send("animeFetchDetailsResult", [
                animeData.englishTitle, animeData.japaneseTitle, [animeData.picture, allImgArr], startDate, endDate,
                animeData.type, animeData.episodes, animeData.genres, animeData.studios, directorsArr,
                animeData.producers.concat(producersArr), writersArr, musicArr, animeData.synopsis
            ]);
            ipc.once("performSave", (event, submission) => {
                // Save the corresponding data.
                exports.animeSave(BrowserWindow, path, fs, log, https, tools, globalWin, usrDataPath, event, submission);
            });
        }).catch(err => log.error("There was an issue getting the pictures associated to the anime " + animeData.title + "."));
    }).catch(err => log.error("There was an issue getting the anime details based on the url " + link + "."));
};



module.exports = exports;