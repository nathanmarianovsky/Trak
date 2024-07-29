/*

BASIC DETAILS: Provides all actions associated to working with manga records.

   - mangaAdd: Handles the saving of a manga record by creating the associated folders and data file.
   - mangaUpdate: Handles the update of a manga record.
   - mangaSearch: Handles the search of myanimelist manga records based on a query.
   - mangaFetchDetails: Handles the fetching of a manga record from myanimelist based on a name.
   - mangaVolumeFetchDetailsByISBN: Handles the fetching of a manga record's volume from goodreads based on an ISBN value.
   - mangaVolumeFetchDetailsByName: Handles the fetching of a manga record's volume from goodreads based on a name.
   - mangaFetchSearch: Handles the search of myanimelist manga records based on a query in order to provide a manga content search.
   - mangaSynopsisFetch: Handles the fetching of a synopsis associated to a manga record from myanimelist.
   - mangaRecordRequest: Provides the front-end with manga details associated to an item clicked in the manga content search.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles the saving of a manga record by creating the associated folders and data file.

   - BrowserWindow provides the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - mainWindow is an object referencing the primary window of the Electron app.
   - tools provides a collection of local functions.
   - dataPath is the path to the local user data.
   - evnt provides the means to interact with the front-end of the Electron app.
   - data is the information associated to the record.
   - auto is a boolean representing whether the data file is being written corresponding to an application autosave.
   - fldrValue is a string corresponding to an existing record's folder name.

*/
exports.mangaAdd = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data, auto, fldrValue) => {
    // Define the primary section of the folder name.
    const primaryName = data[0] + "-" + tools.formatFolderName(data[1] != "" ? data[1] : data[2]);
    let assetsPath = "";
    // Check to see that the folder associated to the new record does not exist.
    if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[1]) + "-0")) && !fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + tools.formatFolderName(data[2]) + "-0"))) {
        // Create a new directory for the assets associated to the new record.
        assetsPath = path.join(dataPath, "Trak", "data", primaryName + "-0", "assets");
        log.info("Creating the assets directory for the new manga record. To be located at " + assetsPath);
        fs.mkdirSync(assetsPath, { "recursive": true });
        tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), tools.recordObjCreation(path, fs, https, dataPath, data, "0"), "A", dataPath, fs, path, evnt, data, false);
    }
    else {
        // Define the list of library records sharing the same name along with the current record's release date.
        const compareList = fs.readdirSync(path.join(dataPath, "Trak", "data")).filter(file => fs.statSync(path.join(dataPath, "Trak", "data", file)).isDirectory() && file.split("-").slice(0, -1).join("-") == primaryName),
            currentDate = data[9];
        // Iterate through the list of comparable library records and determine if there is one that already matches the current record by comparing release dates.
        let q = 0;
        for(; q < compareList.length; q++) {
            // Define the release date from the library record being compared to.
            let compareData = JSON.parse(fs.readFileSync(path.join(dataPath, "Trak", "data", compareList[q], "data.json"), "UTF8")),
                compareDate = compareData.start;
            // Break out of the loop if the release dates match.
            if(compareDate == currentDate) {
                break;
            }
        }
        // If none of the library records being compared to matched up to the current one, then create a library record for the new one.
        if(q == compareList.length) {
            // Create a new directory for the assets associated to the new record.
            assetsPath = path.join(dataPath, "Trak", "data", primaryName + "-" + compareList.length, "assets");
            log.info("Creating the assets directory for the new manga record. To be located at " + assetsPath);
            fs.mkdirSync(assetsPath, { "recursive": true });
            tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), tools.recordObjCreation(path, fs, https, dataPath, data, compareList.length), "A", dataPath, fs, path, evnt, data, false);
        }
        else {
            // Warn the user that a library record already exists for the one being currently added.
            log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[2]) + " already exists!");
            evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[2]));
        }
    }
};



/*

Handles the update of a manga record.

   - BrowserWindow provides the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - mainWindow is an object referencing the primary window of the Electron app.
   - tools provides a collection of local functions.
   - dataPath is the path to the local user data.
   - evnt provides the means to interact with the front-end of the Electron app.
   - data is the information associated to the record.
   - auto is a boolean representing whether the data file is being written corresponding to an application autosave.
   - fldrValue is a string corresponding to an existing record's folder name.

*/
exports.mangaUpdate = (BrowserWindow, path, fs, log, https, tools, mainWindow, dataPath, evnt, data, auto, fldrValue) => {
    // If the name has been updated then change the associated record folder name.
    if((data[1] != "" && data[1] != data[data.length - 1]) || (data[1] == "" && data[2] != "" && data[2] != data[data.length - 1])) {
        let newFldr = data[0] + "-" + tools.formatFolderName(data[1] != "" ? data[1] : data[2]),
            extension = fs.readdirSync(path.join(dataPath, "Trak", "data")).filter(file => fs.statSync(path.join(dataPath, "Trak", "data", file)).isDirectory() && file.includes(data[0] + "-" + tools.formatFolderName(data[1] != "" ? data[1] : data[2]))).length;
        // Define the list of library records sharing the same name along with the current record's release date.
        const compareList = fs.readdirSync(path.join(dataPath, "Trak", "data")).filter(file => fs.statSync(path.join(dataPath, "Trak", "data", file)).isDirectory() && file.includes(newFldr)),
            currentDate = data[9];
        // Iterate through the list of comparable library records and determine if there is one that already matches the current record by comparing release dates.
        let q = 0;
        for(; q < compareList.length; q++) {
            // Define the release date from the library record being compared to.
            let compareData = JSON.parse(fs.readFileSync(path.join(dataPath, "Trak", "data", compareList[q], "data.json"), "UTF8")),
                compareDate = compareData.start;
            // Break out of the loop if the release dates match.
            if(compareDate == currentDate) {
                break;
            }
        }
        // If none of the library records being compared to matched up to the current one, then create a library record for the renamed one.
        if(q == compareList.length) {
            newFldr += "-" + extension;
            fs.rename(path.join(dataPath, "Trak", "data", fldrValue), path.join(dataPath, "Trak", "data", newFldr), err => {
                // If there was an error in renaming the record folder notify the user.
                if(err) {
                    log.error("There was an error in renaming the manga record folder " + data[data.length - 1] + " to " + (data[1] != "" ? data[1] : data[2]) + ".");
                    evnt.sender.send("recordFolderRenameFailure", [data[data.length - 1], data[1] != "" ? data[1] : data[2]]);
                }
                // If no error occured in renaming the record folder write the data file, and copy over the file assets.
                else {
                    tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), tools.recordObjCreation(path, fs, https, dataPath, data, extension), "U", dataPath, fs, path, evnt, data, auto, newFldr);
                }
            });
        }
        else {
            // Warn the user that a library record already exists for the one being currently renamed.
            log.warn("A record for the " + data[0].toLowerCase() + " " + (data[1] != "" ? data[1] : data[2]) + " already exists!");
            evnt.sender.send("recordExists", data[0] + "-" + (data[1] != "" ? data[1] : data[2]));
        }
    }
    else {
        // Write the data file, and copy over the file assets.
        tools.writeDataFile(log, mainWindow, BrowserWindow.getFocusedWindow(), tools.recordObjCreation(path, fs, https, dataPath, data, fldrValue.substring(fldrValue.lastIndexOf("-") + 1)), "U", dataPath, fs, path, evnt, data, auto, fldrValue);
    }
};



/*

Handles the search of myanimelist manga records based on a query.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of strings corresponding to the previous and current queries used for a search.

*/
exports.mangaSearch = (log, malScraper, ev, search) => {
    // Use the MAL scraper to fetch manga listings possibly matching what the user is looking for.
    malScraper.getResultsFromSearch(search[1], "manga").then(data => {
        log.info("MyAnimeList-Scraper has finished getting the search results for the query " + search[1] + ".");
        // Send the attained data to the front-end.
        ev.sender.send("mangaSearchResults", [search[0], search[1], data.map(elem => [elem.name, elem.image_url])]);
    }).catch(err => log.error("There was an issue in obtaining the manga search results for autocomplete options associated to the query " + search[1] + "."));
};



/*

Handles the fetching of a manga record from myanimelist based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - tools provides a collection of local functions.
   - ev provides the means to interact with the front-end of the Electron app.
   - name is a string representing the title of an anime record.
   - GoodReadsScraper provides the means to attain book records from goodreads.

*/
exports.mangaFetchDetails = (log, malScraper, tools, ev, name, GoodReadsScraper) => {
    // Fetch anime details.
    malScraper.getInfoFromName(name, true, "manga").then(mangaData => {
        // Define the parameters which will be passed to the front-end based on the details received.
        let startDate = "",
            endDate = "",
            volumePromiseArr = [];
        // Properly define the start and end date of a manga listing on myanimelist.
        if(mangaData.published != undefined) {
            let splitArr = mangaData.published.split("to");
            startDate = splitArr[0];
            if(splitArr.length > 1) {
                endDate = splitArr[1];
            }
        }
        log.info("MyAnimeList-Scraper has finished getting the details associated to the manga " + name + ".");
        ev.sender.send("mangaFetchDetailsResult", [
            (mangaData.englishTitle != "" ? mangaData.englishTitle : mangaData.title), mangaData.japaneseTitle, [mangaData.picture, [mangaData.picture]], startDate, endDate,
            mangaData.chapters, mangaData.volumes, mangaData.genres, mangaData.authors, mangaData.synopsis
        ]);
        for(let k = 1; k <= parseInt(mangaData.volumes); k++) {
            // Fetch book search results.
            volumePromiseArr.push(new Promise((resolve, reject) => {
                GoodReadsScraper.searchBooks({ "q": (mangaData.volumes == "1" ? mangaData.englishTitle : mangaData.englishTitle + ", Vol. " + k) }).then(bookSearchData => {
                    // Define the item in the search results matching the name provided.
                    let bookLst = bookSearchData.books,
                        // index = bookLst.indexOf(mangaData.englishTitle + ", Vol. " + k),
                        index = 0;
                    for(; bookLst.length; index++) {
                        if(mangaData.volumes == "1" && bookLst[index].title.toLowerCase().includes(mangaData.englishTitle.toLowerCase())
                                && bookLst[index].author.toLowerCase().includes(mangaData.authors[0].split(", ")[0].toLowerCase())) { break; }
                        else if(bookLst[index].title.toLowerCase().includes(mangaData.englishTitle.toLowerCase())
                                && (bookLst[index].title.toLowerCase().includes("vol. " + k) || bookLst[index].title.toLowerCase().includes("#" + k))
                                && bookLst[index].author.toLowerCase().includes(mangaData.authors[0].split(", ")[0].toLowerCase())) { break; }
                    }
                    if(index == bookLst.length) {
                        throw new Error("No associated volumes could be found on GoodReads.");
                    }
                    let bookLstItem = bookSearchData.books[index];
                    // Fetch book details.
                    GoodReadsScraper.getBook({ "url": bookLstItem.url }).then(bookData => {
                        resolve([bookLstItem.title, bookData.coverLarge.replace(".__SX50__", ""), (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin),
                            bookData.publisher, bookData.publicationDate, bookData.description]);
                    }).catch(err => {
                        log.warn("There was an issue in obtaining the details associated to volume #" + k + " of the manga " + name + " via the url " + bookLstItem.url + ".");
                        resolve([]);
                    });
                }).catch(err => {
                    log.warn("There was an issue in obtaining the details associated to volume #" + k + " of the manga " + name + ".");
                    resolve([]);
                });
            }));
        }
        Promise.all(volumePromiseArr).then(results => {
            log.info("GoodReads-Scraper has finished getting the details associated to the manga volumes of " + name + ".");
            ev.sender.send("mangaVolumeFetchDetailsResult", results);
        });
    }).catch(err => log.error("There was an issue in obtaining the details associated to the manga " + name + "."));
};



/*

Handles the fetching of a manga record's volume from goodreads based on an ISBN value.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - isbn is a string representing the ISBN of a book record.
   - tgt is a string representing the id of which element will receive the information on the front-end.

*/
exports.mangaVolumeFetchDetailsByISBN = (log, GoodReadsScraper, ev, isbn, tgt) => {
    // Fetch manga volume details.
    GoodReadsScraper.getBook({ "isbn": isbn }).then(bookData => {
        log.info("GoodReads-Scraper has finished getting the details associated to the manga volume whose ISBN is " + isbn + ".");
        ev.sender.send("mangaSingleVolumeFetchDetailsResult", [tgt, bookData.title, bookData.coverLarge,
            (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.publisher,
            bookData.publicationDate, bookData.description]);
    }).catch(err => log.error("There was an issue in obtaining the details associated to the manga volume whose ISBN is " + isbn + "."));
};



/*

Handles the fetching of a manga record's volume from goodreads based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - name is a string representing the title of a book record.
   - tgt is a string representing the id of which element will receive the information on the front-end.

*/
exports.mangaVolumeFetchDetailsByName = (log, GoodReadsScraper, ev, name, tgt) => {
    // Fetch book search results.
    GoodReadsScraper.searchBooks({ "q": name }).then(bookSearchData => {
        // Define the item in the search results matching the name provided.
        let bookLst = bookSearchData.books.map(elem => elem.title),
            index = bookLst.indexOf(name);
            bookLstItem = bookSearchData.books[index != -1 ? index : 0];
        // Fetch book details.
        GoodReadsScraper.getBook({ "url": bookLstItem.url }).then(bookData => {
            ev.sender.send("mangaSingleVolumeFetchDetailsResult", [tgt, bookData.title, bookData.coverLarge,
                (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.publisher,
                bookData.publicationDate, bookData.description]);
        }).catch(err => log.error("There was an issue in obtaining the details associated to the manga volume " + name + " via the url " + bookLstItem.url + "."));
    }).catch(err => log.error("There was an issue in obtaining the details associated to the manga volume " + name + "."));
};



/*

Handles the search of myanimelist manga records based on a query in order to provide a manga content search.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of a string corresponding to the query used for a search and a page number.

*/
exports.mangaFetchSearch = (log, malScraper, ev, search) => {
    // Fetch the search results.
    log.info("Searching for manga records based on the query " + search[0] + ".");
    malScraper.search.search("manga", { "term": search[0], "has": (search[1] - 1) * 50 }).then(results => {
        const resultsArr = [];
        // Define a promise which will resolve only once a picture has been attained for each search result.
        const picPromise = new Promise((resolve, reject) => {
            // Iterate through the search results.
            results.forEach(elem => {
                // Fetch the manga details based on the URL.
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
                    // Push the manga details into the overall collection.
                    resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, elemData.genres]);
                    if(resultsArr.length == results.length) { resolve(); }
                }).catch(err => {
                    log.error("There was an issue getting the manga details based on the url " + elem.url + ".");
                    resultsArr.push([elem.title, elem.thumbnail.replace("/r/100x140", ""), elem.url, elem.score, []]);
                    if(resultsArr.length == results.length) { resolve(); }
                });
            })
        });
        // Once all manga results have an associated picture send the list of manga releases to the front-end.
        picPromise.then(() => {
            ev.sender.send("fetchResult", [resultsArr, false, "Manga", search[1] == 1]);
        }).catch(err => log.error("There was an issue resolving the promise associated to grabbing manga release pictures based on the search query " + search[0] + "."));
    }).catch(err => {
        log.warn("There was an issue obtaining the manga releases based on the query " + search[0] + ". Returning an empty collection.");
        ev.sender.send("fetchResult", [[], false, "Manga", search[1] == 1]);
    });
};



/*

Handles the fetching of a synopsis associated to a manga record from myanimelist.

   - log provides the means to create application logs to keep track of what is going on.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - ev provides the means to interact with the front-end of the Electron app.
   - link is a string representing the URL of an manga record on myanimelist.

*/
exports.mangaSynopsisFetch = (log, malScraper, ev, link) => {
    // Fetch the manga details based on the URL.
    malScraper.getInfoFromURL(link).then(data => {
        // Provide the manga synopsis to the front-end.
        ev.sender.send("mangaSynopsisFetchResult", data.synopsis);
    }).catch(err => log.error("There was an issue getting the manga details based on the url " + link + "."));
};



/*

Provides the front-end with manga details associated to an item clicked in the manga content search.

   - BrowserWindow and ipc provide the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - malScraper provides the means to attain anime and manga records from myanimelist.
   - tools provides a collection of local functions.
   - globalWin is an object representing the primary window of the Electron app.
   - win is an object representing the addRecord window of the Electron app.
   - usrDataPath is the current path to the local user data.
   - link is a string representing the URL of a manga record on myanimelist.
   - GoodReadsScraper provides the means to attain book records from goodreads.

*/
exports.mangaRecordRequest = (BrowserWindow, ipc, path, fs, log, https, malScraper, tools, globalWin, win, usrDataPath, link, GoodReadsScraper) => {
    // Fetch anime details.
    malScraper.getInfoFromURL(link).then(mangaData => {
        // Define the parameters which will be passed to the front-end based on the details received.
        let startDate = "",
            endDate = "",
            volumePromiseArr = [];
        // Properly define the start and end date of a manga listing on myanimelist.
        if(mangaData.published != undefined) {
            let splitArr = mangaData.published.split("to");
            startDate = splitArr[0];
            if(splitArr.length > 1) {
                endDate = splitArr[1];
            }
        }
        log.info("MyAnimeList-Scraper has finished getting the details associated to the manga " + mangaData.englishTitle + ".");
        win.webContents.send("mangaFetchDetailsResult", [
            (mangaData.englishTitle != "" ? mangaData.englishTitle : mangaData.title), mangaData.japaneseTitle, [mangaData.picture, [mangaData.picture]], startDate, endDate,
            mangaData.chapters, mangaData.volumes, mangaData.genres, mangaData.authors, mangaData.synopsis
        ]);
        ipc.once("performSave", (event, submission) => {
            // Save the corresponding data.
            exports.mangaAdd(BrowserWindow, path, fs, log, https, tools, globalWin, usrDataPath, event, submission[1], submission[2], submission[3]);
        });
        for(let k = 1; k <= parseInt(mangaData.volumes); k++) {
            // Fetch book search results.
            volumePromiseArr.push(new Promise((resolve, reject) => {
                GoodReadsScraper.searchBooks({ "q": (mangaData.volumes == "1" ? mangaData.englishTitle : mangaData.englishTitle + ", Vol. " + k) }).then(bookSearchData => {
                    // Define the item in the search results matching the name provided.
                    let bookLst = bookSearchData.books,
                        // index = bookLst.indexOf(mangaData.englishTitle + ", Vol. " + k),
                        index = 0;
                    for(; bookLst.length; index++) {
                        if(mangaData.volumes == "1" && bookLst[index].title.toLowerCase().includes(mangaData.englishTitle.toLowerCase())
                                && bookLst[index].author.toLowerCase().includes(mangaData.authors[0].split(", ")[0].toLowerCase())) { break; }
                        else if(bookLst[index].title.toLowerCase().includes(mangaData.englishTitle.toLowerCase())
                                && (bookLst[index].title.toLowerCase().includes("vol. " + k) || bookLst[index].title.toLowerCase().includes("#" + k))
                                && bookLst[index].author.toLowerCase().includes(mangaData.authors[0].split(", ")[0].toLowerCase())) { break; }
                    }
                    if(index == bookLst.length) {
                        throw new Error("No associated volumes could be found on GoodReads.");
                    }
                    let bookLstItem = bookSearchData.books[index];
                    // Fetch book details.
                    GoodReadsScraper.getBook({ "url": bookLstItem.url }).then(bookData => {
                        resolve([bookLstItem.title, bookData.coverLarge.replace(".__SX50__", ""), (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin),
                            bookData.publisher, bookData.publicationDate, bookData.description]);
                    }).catch(err => {
                        log.warn("There was an issue in obtaining the details associated to volume #" + k + " of the manga " + mangaData.englishTitle + " via the url " + bookLstItem.url + ".");
                        resolve([]);
                    });
                }).catch(err => {
                    log.warn("There was an issue in obtaining the details associated to volume #" + k + " of the manga " + mangaData.englishTitle + ".");
                    resolve([]);
                });
            }));
        }
        Promise.all(volumePromiseArr).then(results => {
            log.info("GoodReads-Scraper has finished getting the details associated to the manga volumes of " + mangaData.englishTitle + ".");
            win.webContents.send("mangaVolumeFetchDetailsResult", results);
        });
    }).catch(err => log.error("There was an issue getting the manga details based on the url " + link + "."));
};



module.exports = exports;