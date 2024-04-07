/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Display a notification if there was an error opening the associations configuration file.
ipcRenderer.on("notificationsFileReadFailure", event => {
    M.toast({"html": "There was an error in reading the associations configuration file.", "classes": "rounded"});
});



// Display a notification if there was an error writing to the associations configuration file.
ipcRenderer.on("notificationsFileWriteFailure", event => {
    M.toast({"html": "There was an error in writing the associations configuration file.", "classes": "rounded"});
});



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



// Hides record categories on the addRecord page if the user has chosen to hide them.
ipcRenderer.on("activeCategories", (event, activeArr) => {
    // Define the category selection container.
    const categorySelection = document.getElementById("categorySelection"),
        structureCondition = activeArr.filter(elem => elem == true).length == 1,
        secondaryCondition = activeArr.filter(elem => elem == false).length > 0;
    // Iterate through all record categories.
    for(let k = 0; k < activeArr.length; k++) {
        if(structureCondition && activeArr[k] == true) {
            document.getElementById("categoryInitial").classList.add("permHidden");
            categorySelection.children[k].children[0].click();
        }
        else if(secondaryCondition) {
            // Proceed only if the user has actively chosen to hide the record category.
            if(activeArr[k] == false) {
                // Hide the category selection on the navbar.
                categorySelection.children[k].style.display = "none";
            }
            else {
                // If the category is not to be hidden then adjust its width accordingly.
                categorySelection.children[k].style.width = (100 / activeArr.reduce((accum, cur) => accum + (cur == true ? 1 : 0), 0)) + "%";
            }
        }
    }
});



// On a record details fetch update the page accordingly if the addRecord page opened from the index page content search.
ipcRenderer.on("searchRecordStart", (event, type) => {
    // Hide the top nav of the addRecord page.
    document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display = "none";
    // Define the addRecord preloader and display it while the data is being fetched and page is populated with the associated data.
    const animeRecordPreloader = document.getElementById("animePreloader"),
        bookRecordPreloader = document.getElementById("bookPreloader"),
        filmRecordPreloader = document.getElementById("filmPreloader"),
        mangaRecordPreloader = document.getElementById("mangaPreloader"),
        showRecordPreloader = document.getElementById("showPreloader"),
        animeRecordSave = document.getElementById("animeSave"),
        bookRecordSave = document.getElementById("bookSave"),
        filmRecordSave = document.getElementById("filmSave"),
        mangaRecordSave = document.getElementById("mangaSave"),
        showRecordSave = document.getElementById("showSave"),
        animeRecordOptions = document.getElementById("animeOptions"),
        mangaRecordOptions = document.getElementById("mangaOptions"),
        showRecordOptions = document.getElementById("showOptions"),
        animeRecordMoreDetailsBtn = document.getElementById("animeMoreDetailsBtn"),
        filmRecordMoreDetailsBtn = document.getElementById("filmMoreDetailsBtn"),
        mangaRecordMoreDetailsBtn = document.getElementById("mangaMoreDetailsBtn"),
        showRecordMoreDetailsBtn = document.getElementById("showMoreDetailsBtn"),
        animeRecordFetchDetailsBtn = document.getElementById("animeFetchDetailsBtn"),
        bookRecordFetchDetailsBtn = document.getElementById("bookFetchDetailsBtn"),
        filmRecordFetchDetailsBtn = document.getElementById("filmFetchDetailsBtn"),
        mangaRecordFetchDetailsBtn = document.getElementById("mangaFetchDetailsBtn"),
        showRecordFetchDetailsBtn = document.getElementById("showFetchDetailsBtn");
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
    else if(type == "Film") {
        // Hide the page buttons until all data has loaded in.
        filmRecordPreloader.style.top = "-32px";
        filmRecordPreloader.style.visibility = "visible";
        filmRecordSave.style.visibility = "hidden";
        filmRecordMoreDetailsBtn.style.visibility = "hidden";
        filmRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the film record portion of the addRecord page.
        document.getElementById("categoryFilm").click();
        document.getElementById("categoryFilmDiv").children[0].style.marginTop = "3%";
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
    else if(type == "Show") {
        // Hide the page buttons until all data has loaded in.
        showRecordPreloader.style.top = "-32px";
        showRecordPreloader.style.visibility = "visible";
        showRecordSave.style.visibility = "hidden";
        showRecordMoreDetailsBtn.style.visibility = "hidden";
        showRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the film record portion of the addRecord page.
        document.getElementById("categoryShow").click();
        document.getElementById("categoryShowDiv").children[0].style.marginTop = "3%";
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
    ipcRenderer.send("getLibraryRecord", [name, "Update"]);
    ipcRenderer.on("sentLibraryRecordUpdate", (recordEvent, recordArr) => {
        // Display a notification if there was an error in reading the data file.
        if(recordArr[1] == "") {
            M.toast({"html": "There was an error opening the data file associated to the " + toastParse(name) + ".", "classes": "rounded"});
        }
        // If the file loaded without issues populate the page with a record's information.
        else {
            const recordData = JSON.parse(recordArr[1]),
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
                updateFetchedDataString(animeName, recordData.name, true, true);
                relatedContentListeners(animeName);
                updateFetchedDataString(animeJapaneseName, recordData.jname, true);
                relatedContentListeners(animeJapaneseName);
                updateFetchedDataTextArea(animeReview, recordData.review, true);
                relatedContentListeners(animeReview);
                updateFetchedDataTextArea(animeSynopsis, recordData.synopsis, true);
                relatedContentListeners(animeSynopsis);
                updateFetchedDataString(animeDirectors, recordData.directors, true);
                relatedContentListeners(animeDirectors);
                updateFetchedDataString(animeProducers, recordData.producers, true);
                relatedContentListeners(animeProducers);
                updateFetchedDataString(animeWriters, recordData.writers, true);
                relatedContentListeners(animeWriters);
                updateFetchedDataString(animeMusicians, recordData.musicians, true);
                relatedContentListeners(animeMusicians);
                updateFetchedDataString(animeStudio, recordData.studio, true);
                relatedContentListeners(animeStudio);
                updateFetchedDataString(animeLicense, recordData.license, true);
                relatedContentListeners(animeLicense);
                updateImgLoad("Anime", animeImg, recordData.img);
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
                            animeSingleAddition();
                            let curName = document.getElementById("li_" + u + "_AnimeSingle_Name"),
                                curType = document.getElementById("li_" + u + "_AnimeSingle_Type"),
                                curRelease = document.getElementById("li_" + u + "_AnimeSingle_Release"),
                                curWatched = document.getElementById("li_" + u + "_AnimeSingle_LastWatched"),
                                curRating = document.getElementById("li_" + u + "_AnimeSingle_Rating"),
                                curReview = document.getElementById("li_" + u + "_AnimeSingle_Review");
                            updateFetchedDataString(curName, recordData.content[u-1].name, true);
                            relatedContentListeners(curName);
                            curType.value = recordData.content[u-1].type;
                            updateFetchedDataDate(curRelease, recordData.content[u-1].release, true);
                            relatedContentListeners(curRelease);
                            updateFetchedDataDate(curWatched, recordData.content[u-1].watched, true);
                            relatedContentListeners(curWatched);
                            curRating.value = recordData.content[u-1].rating;
                            updateFetchedDataTextArea(curReview, recordData.content[u-1].review, true);
                            relatedContentListeners(curReview);
                            if(recordData.content[u-1].rating != "") { rtngList.push(parseInt(recordData.content[u-1].rating)); }
                        }
                        // If the iterated item is of type season then proceed accordingly.
                        else if(recordData.content[u-1].scenario == "Season") {
                            animeSeasonAddition();
                            let curName = document.getElementById("li_" + u + "_AnimeSeason_Name"),
                                curStart = document.getElementById("li_" + u + "_AnimeSeason_Start"),
                                curEnd = document.getElementById("li_" + u + "_AnimeSeason_End"),
                                curStatus = document.getElementById("li_" + u + "_AnimeSeason_Status");
                            updateFetchedDataString(curName, recordData.content[u-1].name, true);
                            relatedContentListeners(curName);
                            updateFetchedDataDate(curStart, recordData.content[u-1].start, true);
                            relatedContentListeners(curStart);
                            updateFetchedDataDate(curEnd, recordData.content[u-1].end, true);
                            relatedContentListeners(curEnd);
                            curStatus.value = recordData.content[u-1].status;
                            let seasonRatingList = [];
                            // Iterate through the season episodes and add a listing for each within the season populated with the saved data.
                            for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                                animeEpisodeAddition(document.getElementById("li_" + u + "_AnimeSeason"));
                                let curEpisodeName = document.getElementById("li_" + u + "_AnimeEpisode_Name_" + w),
                                    curEpisodeWatched = document.getElementById("li_" + u + "_AnimeEpisode_LastWatched_" + w),
                                    curEpisodeRating = document.getElementById("li_" + u + "_AnimeEpisode_Rating_" + w),
                                    curEpisodeReview = document.getElementById("li_" + u + "_AnimeEpisode_Review_" + w);
                                updateFetchedDataString(curEpisodeName, recordData.content[u-1].episodes[w-1].name, true);
                                relatedContentListeners(curEpisodeName);
                                updateFetchedDataDate(curEpisodeWatched, recordData.content[u-1].episodes[w-1].watched, true);
                                relatedContentListeners(curEpisodeWatched);
                                curEpisodeRating.value = recordData.content[u-1].episodes[w-1].rating;
                                updateFetchedDataTextArea(curEpisodeReview, recordData.content[u-1].episodes[w-1].review, true);
                                relatedContentListeners(curEpisodeReview);
                                if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                            }
                            // Push the corresponding item rating to the associated list.
                            let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                            document.getElementById("li_" + u + "_AnimeSeason_AverageRating").value = seasonRating;
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
                }, 500);
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
                updateFetchedDataString(bookTitle, recordData.name, true, true);
                relatedContentListeners(bookTitle);
                updateFetchedDataString(bookOriginalTitle, recordData.originalName, true);
                relatedContentListeners(bookOriginalTitle);
                updateFetchedDataTextArea(bookReview, recordData.review, true);
                relatedContentListeners(bookReview);
                updateFetchedDataTextArea(bookSynopsis, recordData.synopsis, true);
                relatedContentListeners(bookSynopsis);
                updateFetchedDataString(bookISBN, recordData.isbn, true, false, formatISBN);
                relatedContentListeners(bookISBN);
                updateFetchedDataString(bookAuthor, recordData.authors, true);
                relatedContentListeners(bookAuthor);
                updateFetchedDataString(bookPublisher, recordData.publisher, true);
                relatedContentListeners(bookPublisher);
                updateFetchedDataString(bookPublicationDate, recordData.publicationDate, true);
                relatedContentListeners(bookPublicationDate);
                updateFetchedDataString(bookPages, recordData.pages, true);
                relatedContentListeners(bookPages);
                updateFetchedDataDate(bookLastRead, recordData.read, true);
                relatedContentListeners(bookLastRead);
                bookMediaType.value = recordData.media;
                updateImgLoad("Book", bookImg, recordData.img);
                updateGenreLoad("Book", bookOtherGenres, recordData.genres);
                relatedContentListeners(bookOtherGenres);
                const updateBookPreloader = document.getElementById("bookPreloader");
                updateBookPreloader.style.top = "-32px";
                bookTitle.setAttribute("oldISBN", recordData.isbn);
                bookTitle.setAttribute("oldName", recordData.name);
                // Initialize the select tags.
                initSelect();
            }
            // If the record is of category type film then proceed.
            else if(recordData.category == "Film") {
                const filmSave = document.getElementById("filmSave"),
                    filmMoreDetailsBtn = document.getElementById("filmMoreDetailsBtn"),
                    filmFetchDetailsBtn = document.getElementById("filmFetchDetailsBtn");
                // Define the relevant film record inputs.
                const filmName = document.getElementById("filmName"),
                    filmAlternateName = document.getElementById("filmAlternateName"),
                    filmReleaseDate = document.getElementById("filmReleaseDate"),
                    filmRunningTime = document.getElementById("filmRunningTime"),
                    filmLastWatched = document.getElementById("filmLastWatched"),
                    filmSynopsis = document.getElementById("filmSynopsis"),
                    filmRating = document.getElementById("filmRating"),
                    filmReview = document.getElementById("filmReview"),
                    filmDirectors = document.getElementById("filmDirectors"),
                    filmWriters = document.getElementById("filmWriters"),
                    filmMusicians = document.getElementById("filmMusicians"),
                    filmProducers = document.getElementById("filmProducers"),
                    filmEditors = document.getElementById("filmEditors"),
                    filmCinematographers = document.getElementById("filmCinematographers"),
                    filmDistributors = document.getElementById("filmDistributors"),
                    filmProductionCompanies = document.getElementById("filmProductionCompanies"),
                    filmStarring = document.getElementById("filmStarring"),
                    filmImg = document.getElementById("addRecordFilmImg"),
                    filmOtherGenres = document.getElementById("filmOtherGenres");
                // Load the film record portion of the addRecord page.
                document.getElementById("categoryFilm").click();
                document.getElementById("categoryFilmDiv").children[0].style.marginTop = "3%";
                // Populate the film record page with the saved data.
                updateFetchedDataString(filmName, recordData.name, true, true);
                relatedContentListeners(filmName);
                updateFetchedDataString(filmAlternateName, recordData.alternateName, true);
                relatedContentListeners(filmAlternateName);
                updateFetchedDataTextArea(filmReview, recordData.review, true);
                relatedContentListeners(filmReview);
                updateFetchedDataTextArea(filmSynopsis, recordData.synopsis, true);
                relatedContentListeners(filmSynopsis);
                updateFetchedDataString(filmReleaseDate, recordData.release, true);
                relatedContentListeners(filmReleaseDate);
                updateFetchedDataString(filmRunningTime, recordData.runTime, true);
                relatedContentListeners(filmRunningTime);
                updateFetchedDataString(filmLastWatched, recordData.watched, true);
                relatedContentListeners(filmLastWatched);
                updateFetchedDataString(filmDirectors, recordData.directors, true);
                relatedContentListeners(filmDirectors);
                updateFetchedDataString(filmWriters, recordData.writers, true);
                relatedContentListeners(filmWriters);
                updateFetchedDataString(filmMusicians, recordData.musicians, true);
                relatedContentListeners(filmMusicians);
                updateFetchedDataString(filmProducers, recordData.producers, true);
                relatedContentListeners(filmProducers);
                updateFetchedDataString(filmEditors, recordData.editors, true);
                relatedContentListeners(filmEditors);
                updateFetchedDataString(filmCinematographers, recordData.cinematographers, true);
                relatedContentListeners(filmCinematographers);
                updateFetchedDataString(filmDistributors, recordData.distributors, true);
                relatedContentListeners(filmDistributors);
                updateFetchedDataString(filmProductionCompanies, recordData.productionCompanies, true);
                relatedContentListeners(filmProductionCompanies);
                updateFetchedDataString(filmStarring, recordData.stars, true);
                relatedContentListeners(filmStarring);
                filmRating.value = recordData.rating;
                updateImgLoad("Film", filmImg, recordData.img);
                updateGenreLoad("Film", filmOtherGenres, recordData.genres);
                relatedContentListeners(filmOtherGenres);
                const updateFilmPreloader = document.getElementById("filmPreloader");
                updateFilmPreloader.style.top = "-32px";
                filmName.setAttribute("oldName", recordData.name);
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
                updateFetchedDataString(mangaName, recordData.name, true, true);
                relatedContentListeners(mangaName);
                updateFetchedDataString(mangaJapaneseName, recordData.jname, true);
                relatedContentListeners(mangaJapaneseName);
                updateFetchedDataTextArea(mangaReview, recordData.review, true);
                relatedContentListeners(mangaReview);
                updateFetchedDataTextArea(mangaSynopsis, recordData.synopsis, true);
                relatedContentListeners(mangaSynopsis);
                updateFetchedDataString(mangaPublisher, recordData.publisher, true);
                relatedContentListeners(mangaPublisher);
                updateFetchedDataString(mangaJapanesePublisher, recordData.jpublisher, true);
                relatedContentListeners(mangaJapanesePublisher);
                updateFetchedDataString(mangaIllustrators, recordData.illustrators, true);
                relatedContentListeners(mangaIllustrators);
                updateFetchedDataString(mangaWriters, recordData.writers, true);
                relatedContentListeners(mangaWriters);
                mangaDemographic.value = recordData.demographic;
                updateFetchedDataDate(mangaStartDate, recordData.start, true);
                relatedContentListeners(mangaStartDate);
                updateFetchedDataDate(mangaStartDate, recordData.start, true);
                updateFetchedDataDate(mangaEndDate, recordData.end, true);
                relatedContentListeners(mangaEndDate);
                updateFetchedDataDate(mangaEndDate, recordData.end, true);
                updateImgLoad("Manga", mangaImg, recordData.img);
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
                        if((recordData.content[u-1].scenario == "Chapter" && recordData.content[u-1].name != "Chapter " + u) || recordData.content[u-1].scenario == "Volume") {
                            updateFetchedDataString(curName, recordData.content[u-1].name, true);
                        }
                        relatedContentListeners(curName);
                        updateFetchedDataDate(curRelease, recordData.content[u-1].release, true);
                        relatedContentListeners(curRelease);
                        updateFetchedDataDate(curLastRead, recordData.content[u-1].read, true);
                        relatedContentListeners(curLastRead);
                        curRating.value = recordData.content[u-1].rating;
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
                            updateFetchedDataString(curISBN, recordData.content[u-1].isbn, true, false, formatISBN);
                            relatedContentListeners(curISBN);
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
                }, 500);
                mangaName.setAttribute("oldName", recordData.name != "" ? recordData.name : recordData.jname);
            }
            // If the record is of category type show then proceed.
            else if(recordData.category == "Show") {
                const showSave = document.getElementById("showSave"),
                    showMoreDetailsBtn = document.getElementById("showMoreDetailsBtn"),
                    showFetchDetailsBtn = document.getElementById("showFetchDetailsBtn");
                // Define the relevant show record inputs.
                const showName = document.getElementById("showName"),
                    showAlternateName = document.getElementById("showAlternateName"),
                    showReleaseDate = document.getElementById("showReleaseDate"),
                    showRunningTime = document.getElementById("showRunningTime"),
                    showSynopsis = document.getElementById("showSynopsis"),
                    showRating = document.getElementById("showRating"),
                    showReview = document.getElementById("showReview"),
                    showDirectors = document.getElementById("showDirectors"),
                    showWriters = document.getElementById("showWriters"),
                    showMusicians = document.getElementById("showMusicians"),
                    showProducers = document.getElementById("showProducers"),
                    showEditors = document.getElementById("showEditors"),
                    showCinematographers = document.getElementById("showCinematographers"),
                    showDistributors = document.getElementById("showDistributors"),
                    showProductionCompanies = document.getElementById("showProductionCompanies"),
                    showStarring = document.getElementById("showStarring"),
                    showImg = document.getElementById("addRecordShowImg"),
                    showOtherGenres = document.getElementById("showOtherGenres");
                // Load the show record portion of the addRecord page.
                document.getElementById("categoryShow").click();
                document.getElementById("categoryShowDiv").children[0].style.marginTop = "3%";
                // Populate the show record page with the saved data.
                updateFetchedDataString(showName, recordData.name, true, true);
                relatedContentListeners(showName);
                updateFetchedDataString(showAlternateName, recordData.alternateName, true);
                relatedContentListeners(showAlternateName);
                updateFetchedDataTextArea(showReview, recordData.review, true);
                relatedContentListeners(showReview);
                updateFetchedDataTextArea(showSynopsis, recordData.synopsis, true);
                relatedContentListeners(showSynopsis);
                updateFetchedDataString(showReleaseDate, recordData.release, true);
                relatedContentListeners(showReleaseDate);
                updateFetchedDataString(showRunningTime, recordData.runTime, true);
                relatedContentListeners(showRunningTime);
                updateFetchedDataString(showDirectors, recordData.directors, true);
                relatedContentListeners(showDirectors);
                updateFetchedDataString(showWriters, recordData.writers, true);
                relatedContentListeners(showWriters);
                updateFetchedDataString(showMusicians, recordData.musicians, true);
                relatedContentListeners(showMusicians);
                updateFetchedDataString(showProducers, recordData.producers, true);
                relatedContentListeners(showProducers);
                updateFetchedDataString(showEditors, recordData.editors, true);
                relatedContentListeners(showEditors);
                updateFetchedDataString(showCinematographers, recordData.cinematographers, true);
                relatedContentListeners(showCinematographers);
                updateFetchedDataString(showDistributors, recordData.distributors, true);
                relatedContentListeners(showDistributors);
                updateFetchedDataString(showProductionCompanies, recordData.productionCompanies, true);
                relatedContentListeners(showProductionCompanies);
                updateFetchedDataString(showStarring, recordData.stars, true);
                relatedContentListeners(showStarring);
                showRating.value = recordData.rating + " m";
                updateImgLoad("Show", showImg, recordData.img);
                updateGenreLoad("Show", showOtherGenres, recordData.genres);
                relatedContentListeners(showOtherGenres);
                // Display a preloader to indicate that the page is still loading the show related content. This can take a bit of time depending on the amount to be loaded.
                const updateShowPreloader = document.getElementById("showPreloader");
                updateShowPreloader.style.top = "-32px";
                updateShowPreloader.style.visibility = "visible";
                setTimeout(() => {
                    // Define the collection of ratings to be used in calculating the global average rating of a show.
                    const rtngList = [];
                    // Iterate through the saved related content and add a page item for each.
                    clearTooltips();
                    for(let u = 1; u < recordData.content.length + 1; u++) {
                        showSeasonAddition();
                        let curName = document.getElementById("li_" + u + "_ShowSeason_Name"),
                            curStart = document.getElementById("li_" + u + "_ShowSeason_Start"),
                            curEnd = document.getElementById("li_" + u + "_ShowSeason_End"),
                            curStatus = document.getElementById("li_" + u + "_ShowSeason_Status");
                        updateFetchedDataString(curName, recordData.content[u-1].name, true);
                        relatedContentListeners(curName);
                        updateFetchedDataDate(curStart, recordData.content[u-1].start, true);
                        relatedContentListeners(curStart);
                        updateFetchedDataDate(curEnd, recordData.content[u-1].end, true);
                        relatedContentListeners(curEnd);
                        curStatus.value = recordData.content[u-1].status;
                        let seasonRatingList = [];
                        // Iterate through the season episodes and add a listing for each within the season populated with the saved data.
                        for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                            showEpisodeAddition(document.getElementById("li_" + u + "_ShowSeason"));
                            let curEpisodeName = document.getElementById("li_" + u + "_ShowEpisode_Name_" + w),
                                curEpisodeWatched = document.getElementById("li_" + u + "_ShowEpisode_LastWatched_" + w),
                                curEpisodeRating = document.getElementById("li_" + u + "_ShowEpisode_Rating_" + w),
                                curEpisodeReview = document.getElementById("li_" + u + "_ShowEpisode_Review_" + w);
                            updateFetchedDataString(curEpisodeName, recordData.content[u-1].episodes[w-1].name, true);
                            relatedContentListeners(curEpisodeName);
                            updateFetchedDataDate(curEpisodeWatched, recordData.content[u-1].episodes[w-1].watched, true);
                            relatedContentListeners(curEpisodeWatched);
                            curEpisodeRating.value = recordData.content[u-1].episodes[w-1].rating;
                            updateFetchedDataTextArea(curEpisodeReview, recordData.content[u-1].episodes[w-1].review, true);
                            relatedContentListeners(curEpisodeReview);
                            if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                        }
                        // Push the corresponding item rating to the associated list.
                        let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                        document.getElementById("li_" + u + "_ShowSeason_AverageRating").value = seasonRating;
                        if(seasonRating != "N/A") { rtngList.push(parseFloat(seasonRating)); }
                        // Initialize the select tags.
                        initSelect();
                        // Initialize the observer for the select tags.
                        initSelectObservers();
                    }
                    relatedContentFinisher();
                    resetShowContentCounters();
                    // Write the global average rating of the show record on the page.
                    const showRtng = rtngList.length > 0 ? (rtngList.reduce((accum, cur) => accum + cur, 0) / rtngList.length).toFixed(2) : "N/A";
                    document.getElementById("showRating").value = showRtng;
                    // Display all page buttons now that all data has loaded.
                    showSave.style.visibility = "visible";
                    showOptions.style.visibility = "visible";
                    showMoreDetailsBtn.style.visibility = "visible";
                    showFetchDetailsBtn.style.visibility = "visible";
                    // Hide the show preloader to indicate that the related content has finished loading.
                    updateShowPreloader.style.visibility = "hidden";
                }, 500);
            }
            // Send a request to find record associations.
            ipcRenderer.send("getAssociations", name);
            // Create the associations on the page once the data has been provided.
            ipcRenderer.on("sentAssociations", (associationsEvent, associationsArr) => {
                // Iterate through all the provided associations.
                for(let v = 0; v < associationsArr.length; v++) {
                    // Create an association only if the associated data record has been read properly.
                    if(associationsArr[v][1] != "") {
                        let assocItem = JSON.parse(associationsArr[v][1]),
                            itemRelease = getRecordRelease(assocItem);
                        associationCreation(associationsArr[v][0], assocItem.category, itemRelease, assocItem.name, assocItem.img.length > 0 ? assocItem.img[0] : "");
                    }
                }
                // Add the page listeners associations to the record associations.
                associationsListeners(ipcRenderer);
            });
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
    const categories = ["Anime", "Book", "Film", "Manga", "Show"];
    categories.forEach(category => {
        // Fill the record page with the associated genre options.
        genreListLoad(category, 6);
        // Add the listeners corresponding to the record save.
        window[category.toLowerCase() + "Save"]();
        // Add the listeners corresponding to the related content options.
        if(category == "Anime" || category == "Manga" || category == "Show") {
            window[category.toLowerCase() + "ModalButtons"]();
        }
        // Initialize the observer for the review.
        initReviewObserver(document.getElementById(category.toLowerCase() + "Review"));
        // Initialize the observer for the synopsis.
        initSynopsisObserver(document.getElementById(category.toLowerCase() + "Synopsis"));
    });
    // Initialize the autocomplete functionality for the associations modal.
    associationsInit(ipcRenderer);
});