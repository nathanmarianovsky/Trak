/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on film records.

    - filmSaveFunc: Driver function for saving a film record.
    - filmSave: Processes the information required to save a film record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Driver function for saving a film record.

   - auto is a boolean corresponding to whether the save action is a user submission or the application auto saving.

*/
const filmSaveFunc = (auto = false) => {
    // Define the page components which will contain all associated details.
    const filmBookmarkValue = document.getElementById("filmBookmark").children[0].textContent == "check_box",
        filmName = document.getElementById("filmName").value,
        filmAlternateName = document.getElementById("filmAlternateName").value,
        filmReview = document.getElementById("filmReview").value,
        filmDirectors = document.getElementById("filmDirectors").value,
        filmProducers = document.getElementById("filmProducers").value,
        filmWriters = document.getElementById("filmWriters").value,
        filmMusicians = document.getElementById("filmMusicians").value,
        filmEditors = document.getElementById("filmEditors").value,
        filmCinematographers = document.getElementById("filmCinematographers").value,
        filmDistributors = document.getElementById("filmDistributors").value,
        filmProductionCompanies = document.getElementById("filmProductionCompanies").value,
        filmStarring = document.getElementById("filmStarring").value,
        filmSynopsis = document.getElementById("filmSynopsis").value,
        filmRating = document.getElementById("filmRating").value,
        filmReleaseDate = document.getElementById("filmReleaseDate").value,
        filmRunningTime = document.getElementById("filmRunningTime").value,
        filmLastWatched = document.getElementById("filmLastWatched").value,
        filmImg = document.getElementById("addRecordFilmImg").getAttribute("list").split(","),
        filmFiles = Array.from(document.getElementById("filmAddRecordFiles").files).map(elem => elem.path),
        otherGenres = document.getElementById("filmOtherGenres").value.split(",").map(elem => elem.trim()),
        genresLst = genreList("Film"),
        genres = [];
    // Check to see that a name was provided.
    if(filmName != "") {
        // Save all information about the genres.
        for(let p = 0; p < genresLst.length; p++) {
            genres.push(document.getElementById("filmGenre" + genresLst[p]).checked);
        }
        const ogName = document.getElementById("filmName").getAttribute("oldName"),
            oldTitle = ogName !== null ? ogName : filmName;
        // Send the request to the back-end portion of the app.
        const submissionMaterial = ["Film", filmName, filmAlternateName, filmReview, filmDirectors, filmProducers, filmWriters, filmMusicians, filmEditors,
            filmCinematographers, filmFiles, filmDistributors, filmProductionCompanies, filmStarring, [genresLst, genres, otherGenres], filmSynopsis, filmRating, filmReleaseDate, filmRunningTime,
            filmLastWatched, [document.getElementById("addRecordFilmImg").getAttribute("list") == document.getElementById("addRecordFilmImg").getAttribute("previous"), filmImg],
            filmBookmarkValue, oldTitle];
        ipcRenderer.send("performSave", [document.getElementById("addRecordsNav").style.display == "none" ? true : false, submissionMaterial, auto]);
        saveAssociations("Film", filmName, ipcRenderer);
    }
    // If no name has been provided then notify the user.
    else { M.toast({"html": "A film record requires a name be provided.", "classes": "rounded"}); }
};



/*

Processes the information required to save a film record.

   - min is a string representing the number of minutes for the autosave interval.

*/
var filmSave = min => {
    // Define the page save button.
    const filmSaveBtn = document.getElementById("filmSave");
    // Listen for a click on the save button.
    filmSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        filmSaveFunc();
    });
    setTimeout(() => {
        // Set the page to save the record automatically depending on the user chosen interval.
        min = parseInt(min);
        if(min != 0 && document.getElementById("addRecordsNav").style.display == "none" && document.getElementById("categoryFilm").parentNode.classList.contains("active")) {
            setInterval(() => {
                filmSaveFunc(true);
            }, 1000 * 60 * min);
        }
    }, 500);
};