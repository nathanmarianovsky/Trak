/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.
    - fs and path provide the means to work with local files.
    - basePath is the path to the local settings data.
    - localPath is the path to the local user data.

*/
var { ipcRenderer } = require("electron");
const fs = require("fs"),
    path = require("path"),
    basePath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
    var localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
}
else {
    let configObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
    var localPath = configObj.current != undefined
        ? configObj.current.path.substring(0, configObj.current.path.length - 10)
        : configObj.original.path.substring(0, configObj.original.path.length - 10);
}



// Display a notification whenever a record already exists with a provided name.
ipcRenderer.on("recordExists", (event, response) => {
    M.toast({"html": "A record for the " + toastParse(response) + " already exists! You can remove or update this record on a separate page.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing to the data file of a record.
ipcRenderer.on("writeRecordFailure", (event, response) => {
    M.toast({"html": "There was an issue in writing the data file associated to the " + toastParse(response) + ".", "classes": "rounded"});
});



// Display a notification if there was an error in copying over a specific file.
ipcRenderer.on("copyFailure", (event, response) => {
    M.toast({"html": "There was an error in copying over the file " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful addition of a record.
ipcRenderer.once("addRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + toastParse(response) + " has been created and saved. This window will now close!", "classes": "rounded"});
});



// Display a notification for the successful update of a record.
ipcRenderer.once("updateRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + toastParse(response) + " has been updated. This window will now close!", "classes": "rounded"});
});



// Display a notification if there was an error in renaming a record's directory.
ipcRenderer.on("recordFolderRenameFailure", (event, response) => {
    M.toast({"html": "There was an error in renaming the anime record folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
});



// If the addRecord page is loading for a new addition then show the initial messanging.
ipcRenderer.on("addRecordInitialMessage", event => {
    document.getElementById("categoryInitial").style.display = "initial";
});



// On an anime details fetch from myanimelist update the name accordingly if the addRecord page opened from an index page anime search.
ipcRenderer.on("animeFetchDetailsResultName", (event, name) => {
    document.getElementById("animeName").value = name;
    document.getElementById("animeName").parentNode.children[2].classList.add("active");
});



// On a record details fetch update the page accordingly if the addRecord page opened from the index page content search.
ipcRenderer.on("searchRecordStart", (event, type) => {
    // Hide the top nav of the addRecord page.
    document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display = "none";
    // Define the addRecord preloader and display it while the data is being fetched and page is populated with the associated data.
    const animeRecordPreloader = document.getElementById("animePreloader"),
        bookRecordPreloader = document.getElementById("bookPreloader"),
        mangaRecordPreloader = document.getElementById("mangaPreloader"),
        animeRecordSave = document.getElementById("animeSave"),
        bookRecordSave = document.getElementById("bookSave"),
        mangaRecordSave = document.getElementById("mangaSave"),
        animeRecordOptions = document.getElementById("animeOptions"),
        mangaRecordOptions = document.getElementById("mangaOptions"),
        animeRecordMoreDetailsBtn = document.getElementById("animeMoreDetailsBtn"),
        mangaRecordMoreDetailsBtn = document.getElementById("mangaMoreDetailsBtn"),
        animeRecordFetchDetailsBtn = document.getElementById("animeFetchDetailsBtn"),
        bookRecordFetchDetailsBtn = document.getElementById("bookFetchDetailsBtn");
        mangaRecordFetchDetailsBtn = document.getElementById("mangaFetchDetailsBtn");
    if(type == "Anime") {
        // Hide the page buttons until all data has loaded in.
        animeRecordPreloader.style.top = "-32px";
        animeRecordPreloader.style.visibility = "visible";
        animeRecordSave.style.visibility = "hidden";
        animeRecordOptions.style.visibility = "hidden";
        animeRecordMoreDetailsBtn.style.visibility = "hidden";
        animeRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the anime record portion of the addRecord page.
        document.getElementById("categoryAnime").click();
        document.getElementById("categoryAnimeDiv").children[0].style.marginTop = "3%";
    }
    else if(type == "Book") {
        // Hide the page buttons until all data has loaded in.
        bookRecordPreloader.style.top = "-32px";
        bookRecordPreloader.style.visibility = "visible";
        bookRecordSave.style.visibility = "hidden";
        bookRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the book record portion of the addRecord page.
        document.getElementById("categoryBook").click();
        document.getElementById("categoryBookDiv").children[0].style.marginTop = "3%";
    }
    else if(type == "Manga") {
        // Hide the page buttons until all data has loaded in.
        mangaRecordPreloader.style.top = "-32px";
        mangaRecordPreloader.style.visibility = "visible";
        mangaRecordSave.style.visibility = "hidden";
        mangaRecordOptions.style.visibility = "hidden";
        mangaRecordMoreDetailsBtn.style.visibility = "hidden";
        mangaRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the anime record portion of the addRecord page.
        document.getElementById("categoryManga").click();
        document.getElementById("categoryMangaDiv").children[0].style.marginTop = "3%";
    }
});



// Handle the load of record information on the update page.
ipcRenderer.on("recordUpdateInfo", (event, name) => {
    // Hide the top nav of the addRecord page.
    document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display = "none";
    // Define the addRecord preloader and display it while the data file is read and page is populated with the associated data.
    const updateRecordPreloader = document.getElementById("updateRecordPreloader");
    updateRecordPreloader.style.display = "block";
    // Attempt to read a record's data file.
    fs.readFile(path.join(localPath, "Trak", "data", name, "data.json"), (err, file) => {
        // Display a notification if there was an error in reading the data file.
        if(err) {
            M.toast({"html": "There was an error opening the data file associated to the " + toastParse(name) + ".", "classes": "rounded"});
        }
        // If the file loaded without issues populate the page with a record's information.
        else {
            const recordData = JSON.parse(file),
                otherGenresDivs = Array.from(document.getElementsByClassName("otherGenresDiv"));
            otherGenresDivs.forEach(div => div.style.display = "none");
            // If the record is of category type anime then proceed.
            if(recordData.category == "Anime") {
                const animeSave = document.getElementById("animeSave"),
                    animeOptions = document.getElementById("animeOptions"),
                    animeMoreDetailsBtn = document.getElementById("animeMoreDetailsBtn"),
                    animeFetchDetailsBtn = document.getElementById("animeFetchDetailsBtn");
                // Hide the page buttons until all data has loaded in.
                animeSave.style.visibility = "hidden";
                animeOptions.style.visibility = "hidden";
                animeMoreDetailsBtn.style.visibility = "hidden";
                animeFetchDetailsBtn.style.visibility = "hidden";
                // Define the relevant anime record inputs.
                const animeName = document.getElementById("animeName"),
                    animeJapaneseName = document.getElementById("animeJapaneseName"),
                    animeReview = document.getElementById("animeReview"),
                    animeSynopsis = document.getElementById("animeSynopsis"),
                    animeDirectors = document.getElementById("animeDirectors"),
                    animeProducers = document.getElementById("animeProducers"),
                    animeWriters = document.getElementById("animeWriters"),
                    animeMusicians = document.getElementById("animeMusicians"),
                    animeStudio = document.getElementById("animeStudio"),
                    animeLicense = document.getElementById("animeLicense"),
                    animeImg = document.getElementById("addRecordAnimeImg"),
                    animeOtherGenres = document.getElementById("animeOtherGenres");
                // Load the anime record portion of the addRecord page.
                document.getElementById("categoryAnime").click();
                document.getElementById("categoryAnimeDiv").children[0].style.marginTop = "3%";
                // Populate the anime record page with the saved data.
                // animeName.value = recordData.name;
                // animeName.setAttribute("lastValue", recordData.name);
                // if(recordData.name.trim() != "") { animeName.parentNode.children[2].classList.add("active"); }
                updateFetchedDataString(animeName, recordData.name, true, true);
                relatedContentListeners(animeName);
                // animeJapaneseName.value = recordData.jname;
                // animeJapaneseName.setAttribute("lastValue", recordData.jname);
                // if(recordData.jname.trim() != "") { animeJapaneseName.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeJapaneseName, recordData.jname, true);
                relatedContentListeners(animeJapaneseName);
                // animeReview.value = recordData.review;
                // animeReview.setAttribute("lastValue", recordData.review);
                // if(recordData.review.trim() != "") {
                //     animeReview.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(animeReview);
                // }
                updateFetchedDataTextArea(animeReview, recordData.review, true);
                relatedContentListeners(animeReview);
                // animeSynopsis.value = recordData.synopsis;
                // animeSynopsis.setAttribute("lastValue", recordData.synopsis);
                // if(recordData.synopsis.trim() != "") {
                //     animeSynopsis.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(animeSynopsis);
                // }
                updateFetchedDataTextArea(animeSynopsis, recordData.synopsis, true);
                relatedContentListeners(animeSynopsis);
                // animeDirectors.value = recordData.directors;
                // animeDirectors.setAttribute("lastValue", recordData.directors);
                // if(recordData.directors.trim() != "") { animeDirectors.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeDirectors, recordData.directors, true);
                relatedContentListeners(animeDirectors);
                // animeProducers.value = recordData.producers;
                // animeProducers.setAttribute("lastValue", recordData.producers);
                // if(recordData.producers.trim() != "") { animeProducers.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeProducers, recordData.producers, true);
                relatedContentListeners(animeProducers);
                // animeWriters.value = recordData.writers;
                // animeWriters.setAttribute("lastValue", recordData.writers);
                // if(recordData.writers.trim() != "") { animeWriters.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeWriters, recordData.writers, true);
                relatedContentListeners(animeWriters);
                // animeMusicians.value = recordData.musicians;
                // animeMusicians.setAttribute("lastValue", recordData.musicians);
                // if(recordData.musicians.trim() != "") { animeMusicians.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeMusicians, recordData.musicians, true);
                relatedContentListeners(animeMusicians);
                // animeStudio.value = recordData.studio;
                // animeStudio.setAttribute("lastValue", recordData.studio);
                // if(recordData.studio.trim() != "") { animeStudio.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeStudio, recordData.studio, true);
                relatedContentListeners(animeStudio);
                // animeLicense.value = recordData.license;
                // animeLicense.setAttribute("lastValue", recordData.license);
                // if(recordData.license.trim() != "") { animeLicense.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(animeLicense, recordData.license, true);
                relatedContentListeners(animeLicense);
                // animeImg.setAttribute("list", recordData.img.join(","));
                // animeImg.setAttribute("previous", recordData.img.join(","));
                // animeImg.setAttribute("src", recordData.img.length > 0 && recordData.img[0] != "" ? recordData.img[0] : animeImg.getAttribute("default"));
                // const animeFavImgLink = document.getElementById("animeFavoriteImageLink");
                // if(!animeImg.getAttribute("src").includes("imgDef.png")) {
                //     animeFavImgLink.style.visibility = "visible";
                // }
                // animeFavImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
                updateImgLoad("Anime", animeImg, recordData.img);
                // for(let v = 0; v < recordData.genres[0].length; v++) {
                //     document.getElementById("animeGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                // }
                // let otherGenres = document.getElementById("animeOtherGenres"),
                //     otherGenresDiv = document.getElementById("animeOtherGenresDiv");
                // otherGenresDiv.style.display = "block";
                // otherGenres.value = recordData.genres[2].join(", ");
                // if(otherGenres.value.trim() != "") { otherGenres.nextElementSibling.classList.add("active"); }
                // otherGenres.setAttribute("lastValue", recordData.genres[2].join(", "));
                updateGenreLoad("Anime", animeOtherGenres, recordData.genres);
                relatedContentListeners(animeOtherGenres);
                // Display a preloader to indicate that the page is still loading the anime related content. This can take a bit of time depending on the amount to be loaded.
                const updateAnimePreloader = document.getElementById("animePreloader");
                updateAnimePreloader.style.top = "-32px";
                updateAnimePreloader.style.visibility = "visible";
                setTimeout(() => {
                    // Define the collection of ratings to be used in calculating the global average rating of an anime.
                    const rtngList = [];
                    // Iterate through the saved related content and add a page item for each.
                    clearTooltips();
                    for(let u = 1; u < recordData.content.length + 1; u++) {
                        // If the iterated item is of type single then proceed accordingly.
                        if(recordData.content[u-1].scenario == "Single") {
                            singleAddition();
                            let curName = document.getElementById("li_" + u + "_Single_Name"),
                                curType = document.getElementById("li_" + u + "_Single_Type"),
                                curRelease = document.getElementById("li_" + u + "_Single_Release"),
                                curWatched = document.getElementById("li_" + u + "_Single_LastWatched"),
                                curRating = document.getElementById("li_" + u + "_Single_Rating"),
                                curReview = document.getElementById("li_" + u + "_Single_Review");
                            // curName.value = recordData.content[u-1].name;
                            // curName.setAttribute("lastValue", recordData.content[u-1].name);
                            // if(recordData.content[u-1].name != "") { curName.parentNode.children[1].classList.add("active"); }
                            updateFetchedDataString(curName, recordData.content[u-1].name, true);
                            relatedContentListeners(curName);
                            curType.value = recordData.content[u-1].type;
                            // curRelease.value = recordData.content[u-1].release;
                            // curRelease.setAttribute("lastValue", recordData.content[u-1].release);
                            updateFetchedDataDate(curRelease, recordData.content[u-1].release, true);
                            relatedContentListeners(curRelease);
                            // curWatched.value = recordData.content[u-1].watched;
                            // curWatched.setAttribute("lastValue", recordData.content[u-1].watched);
                            updateFetchedDataDate(curWatched, recordData.content[u-1].watched, true);
                            relatedContentListeners(curWatched);
                            curRating.value = recordData.content[u-1].rating;
                            // curReview.value = recordData.content[u-1].review;
                            // curReview.setAttribute("lastValue", recordData.content[u-1].review);
                            // if(recordData.content[u-1].review != "") {
                            //     curReview.parentNode.children[1].classList.add("active");
                            //     M.textareaAutoResize(curReview);
                            // }
                            updateFetchedDataTextArea(curReview, recordData.content[u-1].review, true);
                            relatedContentListeners(curReview);
                            if(recordData.content[u-1].rating != "") { rtngList.push(parseInt(recordData.content[u-1].rating)); }
                        }
                        // If the iterated item is of type season then proceed accordingly.
                        else if(recordData.content[u-1].scenario == "Season") {
                            seasonAddition();
                            let curName = document.getElementById("li_" + u + "_Season_Name"),
                                curStart = document.getElementById("li_" + u + "_Season_Start"),
                                curEnd = document.getElementById("li_" + u + "_Season_End"),
                                curStatus = document.getElementById("li_" + u + "_Season_Status");
                            // curName.value = recordData.content[u-1].name;
                            // curName.setAttribute("lastValue", recordData.content[u-1].name);
                            // if(recordData.content[u-1].name != "") { curName.parentNode.children[1].classList.add("active"); }
                            updateFetchedDataString(curName, recordData.content[u-1].name, true);
                            relatedContentListeners(curName);
                            // curStart.value = recordData.content[u-1].start;
                            // curStart.setAttribute("lastValue", recordData.content[u-1].start);
                            updateFetchedDataDate(curStart, recordData.content[u-1].start, true);
                            relatedContentListeners(curStart);
                            // curEnd.value = recordData.content[u-1].end;
                            // curEnd.setAttribute("lastValue", recordData.content[u-1].end);
                            updateFetchedDataDate(curEnd, recordData.content[u-1].end, true);
                            relatedContentListeners(curEnd);
                            curStatus.value = recordData.content[u-1].status;
                            let seasonRatingList = [];
                            // Iterate through the season episodes and add a listing for each within the season populated with the saved data.
                            for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                                episodeAddition(document.getElementById("li_" + u + "_Season"));
                                let curEpisodeName = document.getElementById("li_" + u + "_Episode_Name_" + w),
                                    curEpisodeWatched = document.getElementById("li_" + u + "_Episode_LastWatched_" + w),
                                    curEpisodeRating = document.getElementById("li_" + u + "_Episode_Rating_" + w),
                                    curEpisodeReview = document.getElementById("li_" + u + "_Episode_Review_" + w);
                                // curEpisodeName.value = recordData.content[u-1].episodes[w-1].name;
                                // curEpisodeName.setAttribute("lastValue", recordData.content[u-1].episodes[w-1].name);
                                // if(recordData.content[u-1].episodes[w-1].name.trim() != "") { curEpisodeName.parentNode.children[1].classList.add("active"); }
                                updateFetchedDataString(curEpisodeName, recordData.content[u-1].episodes[w-1].name, true);
                                relatedContentListeners(curEpisodeName);
                                // curEpisodeWatched.value = recordData.content[u-1].episodes[w-1].watched;
                                // curEpisodeWatched.setAttribute("lastValue", recordData.content[u-1].episodes[w-1].watched);
                                // if(recordData.content[u-1].episodes[w-1].watched.trim() != "") { curEpisodeWatched.parentNode.children[1].classList.add("active"); }
                                updateFetchedDataDate(curEpisodeWatched, recordData.content[u-1].episodes[w-1].watched, true);
                                relatedContentListeners(curEpisodeWatched);
                                curEpisodeRating.value = recordData.content[u-1].episodes[w-1].rating;
                                // curEpisodeReview.value = recordData.content[u-1].episodes[w-1].review;
                                // curEpisodeReview.setAttribute("lastValue", recordData.content[u-1].episodes[w-1].review);
                                // if(recordData.content[u-1].episodes[w-1].review.trim() != "") {
                                //     curEpisodeReview.parentNode.children[1].classList.add("active");
                                //     M.textareaAutoResize(curEpisodeReview);
                                // }
                                updateFetchedDataTextArea(curEpisodeReview, recordData.content[u-1].episodes[w-1].review, true);
                                relatedContentListeners(curEpisodeReview);
                                if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                            }
                            // Push the corresponding item rating to the associated list.
                            let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                            document.getElementById("li_" + u + "_Season_AverageRating").value = seasonRating;
                            if(seasonRating != "N/A") { rtngList.push(parseFloat(seasonRating)); }
                            // Initialize the select tags.
                            initSelect();
                            // Initialize the observer for the select tags.
                            initSelectObservers();
                        }
                    }
                    relatedContentFinisher();
                    resetAnimeContentCounters();
                    // Write the global average rating of the anime record on the page.
                    const animeRtng = rtngList.length > 0 ? (rtngList.reduce((accum, cur) => accum + cur, 0) / rtngList.length).toFixed(2) : "N/A";
                    document.getElementById("animeRating").value = animeRtng;
                    // Display all page buttons now that all data has loaded.
                    animeSave.style.visibility = "visible";
                    animeOptions.style.visibility = "visible";
                    animeMoreDetailsBtn.style.visibility = "visible";
                    animeFetchDetailsBtn.style.visibility = "visible";
                    // Hide the anime preloader to indicate that the related content has finished loading.
                    updateAnimePreloader.style.visibility = "hidden";
                }, 500)
                animeName.setAttribute("oldName", recordData.name != "" ? recordData.name : recordData.jname);
            }
            // If a record is of category type book then proceed.
            else if(recordData.category == "Book") {
                // Define the relevant book record inputs.
                const bookTitle = document.getElementById("bookTitle"),
                    bookOriginalTitle = document.getElementById("bookOriginalTitle"),
                    bookISBN = document.getElementById("bookISBN"),
                    bookAuthor = document.getElementById("bookAuthor"),
                    bookPublisher = document.getElementById("bookPublisher"),
                    bookPublicationDate = document.getElementById("bookPublicationDate"),
                    bookPages = document.getElementById("bookPages"),
                    bookMediaType = document.getElementById("bookMediaType"),
                    bookLastRead = document.getElementById("bookLastRead"),
                    bookSynopsis = document.getElementById("bookSynopsis"),
                    bookRating = document.getElementById("bookRating"),
                    bookReview = document.getElementById("bookReview"),
                    bookImg = document.getElementById("addRecordBookImg"),
                    bookOtherGenres = document.getElementById("bookOtherGenres");
                // Load the book record portion of the addRecord page.
                document.getElementById("categoryBook").click();
                document.getElementById("categoryBookDiv").children[0].style.marginTop = "3%";
                // Populate the book record page with the saved data.
                // bookTitle.value = recordData.name;
                // bookTitle.setAttribute("lastValue", recordData.name);
                // if(recordData.name.trim() != "") { bookTitle.parentNode.children[2].classList.add("active"); }
                updateFetchedDataString(bookTitle, recordData.name, true, true);
                relatedContentListeners(bookTitle);
                // bookOriginalTitle.value = recordData.originalName;
                // bookOriginalTitle.setAttribute("lastValue", recordData.originalName);
                updateFetchedDataString(bookOriginalTitle, recordData.originalName, true);
                relatedContentListeners(bookOriginalTitle);
                // bookReview.value = recordData.review;
                // bookReview.setAttribute("lastValue", recordData.review);
                // if(recordData.review.trim() != "") {
                //     bookReview.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(bookReview);
                // }
                updateFetchedDataTextArea(bookReview, recordData.review, true);
                relatedContentListeners(bookReview);
                // bookSynopsis.value = recordData.synopsis;
                // bookSynopsis.setAttribute("lastValue", recordData.synopsis);
                // if(recordData.synopsis.trim() != "") {
                //     bookSynopsis.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(bookSynopsis);
                // }
                updateFetchedDataTextArea(bookSynopsis, recordData.synopsis, true);
                relatedContentListeners(bookSynopsis);
                // bookISBN.value = recordData.isbn;
                // bookISBN.setAttribute("lastValue", recordData.isbn);
                // if(recordData.isbn.trim() != "") { bookISBN.parentNode.children[1].classList.add("active"); }
                // formatISBN(bookISBN);
                updateFetchedDataString(bookISBN, recordData.isbn, true, false, formatISBN);
                relatedContentListeners(bookISBN);
                // bookAuthor.value = recordData.authors;
                // bookAuthor.setAttribute("lastValue", recordData.authors);
                // if(recordData.authors.trim() != "") { bookAuthor.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(bookAuthor, recordData.authors, true);
                relatedContentListeners(bookAuthor);
                // bookPublisher.value = recordData.publisher;
                // bookPublisher.setAttribute("lastValue", recordData.publisher);
                // if(recordData.publisher.trim() != "") { bookPublisher.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(bookPublisher, recordData.publisher, true);
                relatedContentListeners(bookPublisher);
                // bookPublicationDate.value = recordData.publicationDate;
                // bookPublicationDate.setAttribute("lastValue", recordData.publicationDate);
                // if(recordData.publicationDate.trim() != "") { bookPublicationDate.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(bookPublicationDate, recordData.publicationDate, true);
                relatedContentListeners(bookPublicationDate);
                // bookPages.value = recordData.pages;
                // bookPages.setAttribute("lastValue", recordData.pages);
                // if(recordData.pages.trim() != "") { bookPages.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(bookPages, recordData.pages, true);
                relatedContentListeners(bookPages);
                // bookLastRead.value = recordData.lastRead;
                // bookLastRead.setAttribute("lastValue", recordData.lastRead);
                // if(recordData.lastRead.trim() != "") { bookLastRead.parentNode.children[1].classList.add("active"); }
                updateFetchedDataDate(bookLastRead, recordData.lastRead, true);
                relatedContentListeners(bookLastRead);
                bookMediaType.value = recordData.media;
                // bookImg.setAttribute("list", recordData.img.join(","));
                // bookImg.setAttribute("previous", recordData.img.join(","));
                // bookImg.setAttribute("src", recordData.img.length > 0 && recordData.img[0] != "" ? recordData.img[0] : bookImg.getAttribute("default"));
                // const bookFavImgLink = document.getElementById("bookFavoriteImageLink");
                // if(!bookImg.getAttribute("src").includes("imgDef.png")) {
                //     bookFavImgLink.style.visibility = "visible";
                // }
                // bookFavImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
                updateImgLoad("Book", bookImg, recordData.img);
                // for(let v = 0; v < recordData.genres[0].length; v++) {
                //     document.getElementById("bookGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                // }
                // let otherGenres = document.getElementById("bookOtherGenres"),
                //     otherGenresDiv = document.getElementById("bookOtherGenresDiv");
                // otherGenresDiv.style.display = "block";
                // otherGenres.value = recordData.genres[2].join(", ");
                // if(otherGenres.value.trim() != "") { otherGenres.nextElementSibling.classList.add("active"); }
                // otherGenres.setAttribute("lastValue", recordData.genres[2].join(", "));
                updateGenreLoad("Book", bookOtherGenres, recordData.genres);
                relatedContentListeners(bookOtherGenres);
                bookTitle.setAttribute("oldISBN", recordData.isbn);
                bookTitle.setAttribute("oldName", recordData.name);
                // Initialize the select tags.
                initSelect();
            }
            // If a record is of category type manga then proceed.
            else if(recordData.category == "Manga") {
                const mangaSave = document.getElementById("mangaSave"),
                    mangaOptions = document.getElementById("mangaOptions"),
                    mangaMoreDetailsBtn = document.getElementById("mangaMoreDetailsBtn"),
                    mangaFetchDetailsBtn = document.getElementById("mangaFetchDetailsBtn");
                // Hide the page buttons until all data has loaded in.
                mangaSave.style.visibility = "hidden";
                mangaOptions.style.visibility = "hidden";
                mangaMoreDetailsBtn.style.visibility = "hidden";
                mangaFetchDetailsBtn.style.visibility = "hidden";
                // Define the relevant manga record inputs.
                const mangaName = document.getElementById("mangaName"),
                    mangaJapaneseName = document.getElementById("mangaJapaneseName"),
                    mangaReview = document.getElementById("mangaReview"),
                    mangaSynopsis = document.getElementById("mangaSynopsis"),
                    mangaPublisher = document.getElementById("mangaPublisher"),
                    mangaJapanesePublisher = document.getElementById("mangaJapanesePublisher"),
                    mangaWriters = document.getElementById("mangaWriters"),
                    mangaIllustrators = document.getElementById("mangaIllustrator"),
                    mangaDemographic = document.getElementById("mangaDemographic"),
                    mangaStartDate = document.getElementById("mangaStartDate"),
                    mangaEndDate = document.getElementById("mangaEndDate"),
                    mangaImg = document.getElementById("addRecordMangaImg"),
                    mangaOtherGenres = document.getElementById("mangaOtherGenres");
                // Load the manga record portion of the addRecord page.
                document.getElementById("categoryManga").click();
                document.getElementById("categoryMangaDiv").children[0].style.marginTop = "3%";
                // Populate the manga record page with the saved data.
                // mangaName.value = recordData.name;
                // mangaName.setAttribute("lastValue", recordData.name);
                // if(recordData.name.trim() != "") { mangaName.parentNode.children[2].classList.add("active"); }
                updateFetchedDataString(mangaName, recordData.name, true, true);
                relatedContentListeners(mangaName);
                // mangaJapaneseName.value = recordData.jname;
                // mangaJapaneseName.setAttribute("lastValue", recordData.jname);
                // if(recordData.jname.trim() != "") { mangaJapaneseName.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(mangaJapaneseName, recordData.jname, true);
                relatedContentListeners(mangaJapaneseName);
                // mangaReview.value = recordData.review;
                // mangaReview.setAttribute("lastValue", recordData.review);
                // if(recordData.review.trim() != "") {
                //     mangaReview.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(mangaReview);
                // }
                updateFetchedDataTextArea(mangaReview, recordData.review, true);
                relatedContentListeners(mangaReview);
                // mangaSynopsis.value = recordData.synopsis;
                // mangaSynopsis.setAttribute("lastValue", recordData.synopsis);
                // if(recordData.synopsis.trim() != "") {
                //     mangaSynopsis.parentNode.children[1].classList.add("active");
                //     M.textareaAutoResize(mangaSynopsis);
                // }
                updateFetchedDataTextArea(mangaSynopsis, recordData.synopsis, true);
                relatedContentListeners(mangaSynopsis);
                // mangaPublisher.value = recordData.publisher;
                // mangaPublisher.setAttribute("lastValue", recordData.publisher);
                // if(recordData.publisher.trim() != "") { mangaPublisher.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(mangaPublisher, recordData.publisher, true);
                relatedContentListeners(mangaPublisher);
                // mangaJapanesePublisher.value = recordData.jpublisher;
                // mangaJapanesePublisher.setAttribute("lastValue", recordData.jpublisher);
                // if(recordData.jpublisher.trim() != "") { mangaJapanesePublisher.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(mangaJapanesePublisher, recordData.jpublisher, true);
                relatedContentListeners(mangaJapanesePublisher);
                // mangaIllustrators.value = recordData.illustrators;
                // mangaIllustrators.setAttribute("lastValue", recordData.illustrators);
                // if(recordData.illustrators.trim() != "") { mangaIllustrators.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(mangaIllustrators, recordData.illustrators, true);
                relatedContentListeners(mangaIllustrators);
                // mangaWriters.value = recordData.writers;
                // mangaWriters.setAttribute("lastValue", recordData.writers);
                // if(recordData.writers.trim() != "") { mangaWriters.parentNode.children[1].classList.add("active"); }
                updateFetchedDataString(mangaWriters, recordData.writers, true);
                relatedContentListeners(mangaWriters);
                mangaDemographic.value = recordData.demographic;
                // mangaStartDate.value = recordData.start;
                // mangaStartDate.setAttribute("lastValue", recordData.start);
                // if(recordData.start.trim() != "") { mangaStartDate.parentNode.children[1].classList.add("active"); }
                updateFetchedDataDate(mangaStartDate, recordData.start, true);
                relatedContentListeners(mangaStartDate);
                // mangaEndDate.value = recordData.end;
                // mangaEndDate.setAttribute("lastValue", recordData.end);
                // if(recordData.end.trim() != "") { mangaEndDate.parentNode.children[1].classList.add("active"); }
                updateFetchedDataDate(mangaStartDate, recordData.start, true);
                relatedContentListeners(mangaEndDate);
                // mangaImg.setAttribute("list", recordData.img.join(","));
                // mangaImg.setAttribute("previous", recordData.img.join(","));
                // mangaImg.setAttribute("src", recordData.img.length > 0 && recordData.img[0] != "" ? recordData.img[0] : mangaImg.getAttribute("default"));
                // const mangaFavImgLink = document.getElementById("mangaFavoriteImageLink");
                // if(!mangaImg.getAttribute("src").includes("imgDef.png")) {
                //     mangaFavImgLink.style.visibility = "visible";
                // }
                // mangaFavImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
                updateImgLoad("Manga", mangaImg, recordData.img);
                // for(let v = 0; v < recordData.genres[0].length; v++) {
                //     document.getElementById("mangaGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                // }
                // let otherGenres = document.getElementById("mangaOtherGenres"),
                //     otherGenresDiv = document.getElementById("mangaOtherGenresDiv");
                // otherGenresDiv.style.display = "block";
                // otherGenres.value = recordData.genres[2].join(", ");
                // if(otherGenres.value.trim() != "") { otherGenres.nextElementSibling.classList.add("active"); }
                // otherGenres.setAttribute("lastValue", recordData.genres[2].join(", "));
                updateGenreLoad("Manga", mangaOtherGenres, recordData.genres);
                relatedContentListeners(mangaOtherGenres);
                // Display a preloader to indicate that the page is still loading the manga related content. This can take a bit of time depending on the amount to be loaded.
                const updateMangaPreloader = document.getElementById("mangaPreloader");
                updateMangaPreloader.style.top = "-32px";
                updateMangaPreloader.style.visibility = "visible";
                setTimeout(() => {
                    // Define the collection of ratings to be used in calculating the global average rating of a manga.
                    const rtngList = [[],[]];
                    // Iterate through the saved related content and add a page item for each.
                    clearTooltips();
                    for(let u = 1; u < recordData.content.length + 1; u++) {
                        mangaItemAddition(recordData.content[u-1].scenario);
                        let curName = document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario + "_Name"),
                            curRelease = document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario + "_Release"),
                            curLastRead = document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario + "_LastRead"),
                            curRating = document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario + "_Rating"),
                            curReview = document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario + "_Review");
                        // curName.value = recordData.content[u-1].name;
                        // curName.setAttribute("lastValue", recordData.content[u-1].name);
                        // curName.classList.remove("valid");
                        // if(recordData.content[u-1].name != "") { curName.parentNode.children[1].classList.add("active"); }
                        updateFetchedDataString(curName, recordData.content[u-1].name, true);
                        relatedContentListeners(curName);
                        // curRelease.value = recordData.content[u-1].release;
                        // curRelease.setAttribute("lastValue", recordData.content[u-1].release);
                        updateFetchedDataDate(curRelease, recordData.content[u-1].release, true);
                        relatedContentListeners(curRelease);
                        // curLastRead.value = recordData.content[u-1].read;
                        // curLastRead.setAttribute("lastValue", recordData.content[u-1].read);
                        updateFetchedDataDate(curLastRead, recordData.content[u-1].read, true);
                        relatedContentListeners(curLastRead);
                        curRating.value = recordData.content[u-1].rating;
                        // curReview.value = recordData.content[u-1].review;
                        // curReview.setAttribute("lastValue", recordData.content[u-1].review);
                        // if(recordData.review != "") {
                        //     curReview.parentNode.children[1].classList.add("active");
                        //     M.textareaAutoResize(curReview);
                        // }
                        updateFetchedDataTextArea(curReview, recordData.content[u-1].review, true);
                        relatedContentListeners(curReview);
                        // If the iterated item is of type chapter then proceed accordingly.
                        if(recordData.content[u-1].scenario == "Chapter") {
                            document.getElementById("li_" + u + "_" + recordData.content[u-1].scenario).style.display = "none";
                            if(recordData.content[u-1].rating != "") { rtngList[0].push(parseInt(recordData.content[u-1].rating)); }
                        }
                        // If the iterated item is of type volume then proceed accordingly.
                        else if(recordData.content[u-1].scenario == "Volume") {
                            let curISBN = document.getElementById("li_" + u + "_Volume_ISBN"),
                                curSynopsis = document.getElementById("li_" + u + "_Volume_Synopsis");
                            // curISBN.value = recordData.content[u-1].isbn;
                            // curISBN.setAttribute("lastValue", recordData.content[u-1].isbn);
                            // formatISBN(curISBN);
                            // if(recordData.content[u-1].isbn.trim() != "") { curISBN.parentNode.children[1].classList.add("active"); }
                            updateFetchedDataString(curISBN, recordData.content[u-1].isbn, true);
                            relatedContentListeners(curISBN);
                            // curSynopsis.value = recordData.content[u-1].synopsis;
                            // curSynopsis.setAttribute("lastValue", recordData.content[u-1].synopsis);
                            // if(recordData.synopsis.trim() != "") {
                            //     curSynopsis.parentNode.children[1].classList.add("active");
                            //     M.textareaAutoResize(curSynopsis);
                            // }
                            updateFetchedDataTextArea(curSynopsis, recordData.content[u-1].synopsis, true);
                            relatedContentListeners(curSynopsis);
                            if(recordData.content[u-1].rating != "") { rtngList[1].push(parseInt(recordData.content[u-1].rating)); }
                        }
                    }
                    relatedContentFinisher();
                    resetMangaContentCounters();
                    // Write the global average rating of the anime record on the page.
                    const mangaRtng = rtngList[0].length + rtngList[1].length == 0 ? "N/A" : (((rtngList[0].length == 0 ? 0 : (rtngList[0].reduce((accum, cur) => accum + cur, 0) / rtngList[0].length))
                        + (rtngList[1].length == 0 ? 0 : (rtngList[1].reduce((accum, cur) => accum + cur, 0) / rtngList[1].length))) / (rtngList[0].length != 0 && rtngList[1].length != 0 ? 2 : 1)).toFixed(2);
                    document.getElementById("mangaRating").value = mangaRtng;
                    // Display all page buttons now that all data has loaded.
                    mangaSave.style.visibility = "visible";
                    mangaOptions.style.visibility = "visible";
                    mangaMoreDetailsBtn.style.visibility = "visible";
                    mangaFetchDetailsBtn.style.visibility = "visible";
                    // Hide the manga preloader to indicate that the related content has finished loading.
                    updateMangaPreloader.style.visibility = "hidden";
                }, 500)
                mangaName.setAttribute("oldName", recordData.name != "" ? recordData.name : recordData.jname);
            }
        }
        // Hide the addRecord preloader once the file data has been added.
        updateRecordPreloader.style.display = "none";
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Initialize the select tags on the page.
    initSelect();
    // Initialize the floating action button on the page.
    initFAB();
    // Initialize the menu tooltips.
    initTooltips()
    // Initialize the modals.
    initModal();
    // Initialize the collapsible divs.
    initCollapsible();
    // Add the listeners corresponding to the record choices.
    recordChoicesButtons();
    const categories = ["Anime", "Book", "Film", "Manga"];
    categories.forEach(category => {
        // Fill the record page with the associated genre options.
        genreListLoad(category, 6);
        // Add the listeners corresponding to the record save.
        window[category.toLowerCase() + "Save"]();
        // Add the listeners corresponding to the related content options.
        if(category == "Anime" || category == "Manga") {
            window[category.toLowerCase() + "ModalButtons"]();
        }
        // Initialize the observer for the review.
        initReviewObserver(document.getElementById(category.toLowerCase() + "Review"));
        // Initialize the observer for the synopsis.
        initSynopsisObserver(document.getElementById(category.toLowerCase() + "Synopsis"));
    });
});