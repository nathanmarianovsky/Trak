/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on film records.

    - filmSave: Processes the information required to save a film record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a film record.

*/
var filmSave = () => {
    // Define the page save button.
    const filmSaveBtn = document.getElementById("filmSave");
    // Listen for a click on the save button.
    filmSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const filmName = document.getElementById("filmName").value,
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
                filmLastWatched, [document.getElementById("addRecordFilmImg").getAttribute("list") == document.getElementById("addRecordFilmImg").getAttribute("previous"), filmImg], oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "A film record requires a name be provided.", "classes": "rounded"}); }
    });
};