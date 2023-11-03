/*

BASIC DETAILS: Provides all actions associated to working with book records.

   - bookObjCreation: Creates an object associated to a book record in order to save/update.
   - bookSave: Handles the saving of a book record by creating the associated folders and data file.
   - bookUpdate: Handles the update of a book record.
   - bookSearch: Handles the search of goodreads book records based on a query.
   - bookFetchDetailsByName: Handles the fetching of a book record from goodreads based on a name.
   - bookFetchDetailsByISBN: Handles the fetching of a book record from goodreads based on a name.
   - bookFetchSearch: Handles the search of goodreads book records based on a query in order to provide a book content search.
   - bookSynopsisFetch: Handles the fetching of a synopsis associated to a book record from goodreads.
   - bookRecordRequest: Provides the front-end with book details associated to an item clicked in the book content search.

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
        "img": tools.objCreationImgs(path, fs, https, tools, dir, providedData[0] + "-" + providedData[3] + "-" + providedData[1].replace(/[/\\?%*:|"<>|\#]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), providedData[15])
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
    if(!fs.existsSync(path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>|\#]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")))) {
        // Create a new directory for the assets associated to the new record.
        const assetsPath = path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>|\#]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join(""), "assets");
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
        fs.rename(path.join(dataPath, "Trak", "data", data[0] + "-" + data[data.length - 1][0] + "-" + data[data.length - 1][1].replace(/[/\\?%*:|"<>|\#]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")),
            path.join(dataPath, "Trak", "data", data[0] + "-" + data[3] + "-" + data[1].replace(/[/\\?%*:|"<>|\#]/g, "_").split(" ").map(elem => elem.charAt(0).toUpperCase() + elem.slice(1)).join("")), err => {
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



/*

Handles the search of goodreads book records based on a query.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of strings corresponding to the previous and current queries used for a search.

*/
exports.bookSearch = (log, GoodReadsScraper, ev, search) => {
    // Use the goodreads scraper to fetch book listings possibly matching what the user is looking for.
    GoodReadsScraper.searchBooks({ "q": search[1] }).then(data => {
        log.info("GoodReadsScraper has finished getting the search results for the query " + search[1] + ".");
        // Send the attained data to the front-end.
        ev.sender.send("bookSearchResults", [search[0], search[1], data.books.map(elem => [elem.title, elem.coverLarge])]);
    }).catch(err => log.error("There was an issue in obtaining the book search results for autocomplete options associated to the query " + search[1] + "."));
};



/*

Handles the fetching of a book record from goodreads based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - name is a string representing the title of a book record.

*/
exports.bookFetchDetailsByName = (log, GoodReadsScraper, ev, name, index = -1) => {
    // Fetch book search results.
    GoodReadsScraper.searchBooks({ "q": name }).then(bookSearchData => {
        // Define the item in the search results matching the name provided.
        let bookLst = bookSearchData.books.map(elem => elem.title),
            bookLstItem = bookSearchData.books[index == -1 ? bookLst.indexOf(name) : index];
        // Fetch book details.
        GoodReadsScraper.getBook({ "url": "https://www.goodreads.com/en/book/show/" + bookLstItem.id }).then(bookData => {
            ev.sender.send("bookFetchDetailsResult", [bookData.title, bookData.originalTitle, bookData.coverLarge,
                (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
                bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres]);
        }).catch(err => log.error("There was an issue in obtaining the details associated to the book " + (index == -1 ? "title " : "ASIN ") + name + " via the url " + bookLstItem.url + "."));
    }).catch(err => log.error("There was an issue in obtaining the details associated to the book " + (index == -1 ? "title " : "ASIN ") + name + "."));
};



/*

Handles the fetching of a book record from goodreads based on a name.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - isbn is a string representing the ISBN of a book record.

*/
exports.bookFetchDetailsByISBN = (log, GoodReadsScraper, ev, isbn) => {
    // Fetch book details.
    GoodReadsScraper.getBook({ "isbn": isbn }).then(bookData => {
        ev.sender.send("bookFetchDetailsResult", [bookData.title, bookData.originalTitle, bookData.coverLarge,
            (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
            bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres]);
    }).catch(err => log.error("There was an issue in obtaining the details associated to the book whose ISBN is " + isbn + "."));
};



/*

Handles the search of goodreads book records based on a query in order to provide a book content search.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - search is an array of a string corresponding to the query used for a search and a page number.

*/
exports.bookFetchSearch = (log, GoodReadsScraper, ev, search) => {
    // Fetch the search results.
    log.info("Searching for book records based on the query " + search[0] + ".");
    GoodReadsScraper.searchBooks({ "q": search[0], "page": search[1] }).then(results => {
        const resultsArr = [];
        // Define a promise which will resolve only once a picture has been attained for each search result.
        const itemPromise = new Promise((resolve, reject) => {
            // Iterate through the search results.
            results.books.forEach(elem => {
                // Fetch the anime details based on the URL.
                GoodReadsScraper.getBook({ "url": "https://www.goodreads.com/en/book/show/" + elem.id }).then(elemData => {
                    elemData.genres = elemData.genres.map(str => str == "Sci-Fi" ? "SciFi" : str);
                    // Push the book details into the overall collection.
                    resultsArr.push([elemData.title, elemData.coverLarge, elemData.url, (elemData.rating * 2).toFixed(2), elemData.genres]);
                    if(resultsArr.length == results.books.length) { resolve(); }
                }).catch(err => {
                    log.error("There was an issue getting the book details based on the url " + elem.url + ".");
                    resultsArr.push([elem.title, elem.coverLarge, elem.url, (elem.rating * 2).toFixed(2), []]);
                    if(resultsArr.length == results.books.length) { resolve(); }
                });
            });
        });
        // Once all book results have the necessary details send the list of books to the front-end.
        itemPromise.then(() => {
            ev.sender.send("fetchResult", [resultsArr, false, "Book", search[1] == 1]);
        }).catch(err => log.error("There was an issue resolving the promise associated to grabbing book details based on the search query " + search[0] + "."));
    }).catch(err => {
        log.warn("There was an issue obtaining the books based on the query " + search[0] + ". Returning an empty collection.");
        ev.sender.send("fetchResult", [[], false, "Book", search[1] == 1]);
    });
};



/*

Handles the fetching of a synopsis associated to a book record from goodreads.

   - log provides the means to create application logs to keep track of what is going on.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - ev provides the means to interact with the front-end of the Electron app.
   - link is a string representing the URL of a book record on goodreads.

*/
exports.bookSynopsisFetch = (log, GoodReadsScraper, ev, link) => {
    // Fetch the book details based on the URL.
    GoodReadsScraper.getBook({ "url": link }).then(data => {
        // Provide the book synopsis to the front-end.
        ev.sender.send("bookSynopsisFetchResult", data.description);
    }).catch(err => log.error("There was an issue getting the book details based on the url " + link + "."));
};



/*

Provides the front-end with book details associated to an item clicked in the book content search.

   - BrowserWindow and ipc provide the means to operate the Electron app.
   - path and fs provide the means to work with local files.
   - log provides the means to create application logs to keep track of what is going on.
   - https provides the means to download files.
   - GoodReadsScraper provides the means to attain book records from goodreads.
   - tools provides a collection of local functions.
   - globalWin is an object representing the primary window of the Electron app.
   - win is an object representing the addRecord window of the Electron app.
   - usrDataPath is the current path to the local user data.
   - link is a string representing the URL of an anime record on myanimelist.

*/
exports.bookRecordRequest = (BrowserWindow, ipc, path, fs, log, https, GoodReadsScraper, tools, globalWin, win, usrDataPath, link) => {
    // Fetch book details.
    GoodReadsScraper.getBook({ "url": link }).then(bookData => {
        // Send the attained data to the front-end.
        log.info("GoodReads-Scraper has finished getting the details associated to the book " + bookData.title + ".");
        win.webContents.send("bookFetchDetailsResult", [
            bookData.title, bookData.originalTitle, bookData.coverLarge,
            (bookData.isbn13 !== null ? bookData.isbn13 : bookData.asin), bookData.authors.join(", "), bookData.publisher,
            bookData.publicationDate, bookData.pages, bookData.media, bookData.description, bookData.genres
        ]);
        ipc.once("performSave", (event, submission) => {
            // Save the corresponding data.
            exports.bookSave(BrowserWindow, path, fs, log, https, tools, globalWin, usrDataPath, event, submission);
        });
    }).catch(err => log.error("There was an issue getting the book details based on the url " + link + "."));
};



module.exports = exports;