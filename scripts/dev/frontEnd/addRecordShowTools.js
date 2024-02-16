/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on show records.

    - showSave: Processes the information required to save a show record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a show record.

*/
var showSave = () => {
    // Define the page save button.
    const showSaveBtn = document.getElementById("showSave");
    // Listen for a click on the save button.
    showSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const showName = document.getElementById("showName").value,
            showAlternateName = document.getElementById("showAlternateName").value,
            showReview = document.getElementById("showReview").value,
            showDirectors = document.getElementById("showDirectors").value,
            showProducers = document.getElementById("showProducers").value,
            showWriters = document.getElementById("showWriters").value,
            showMusicians = document.getElementById("showMusicians").value,
            showEditors = document.getElementById("showEditors").value,
            showCinematographers = document.getElementById("showCinematographers").value,
            showDistributors = document.getElementById("showDistributors").value,
            showProductionCompanies = document.getElementById("showProductionCompanies").value,
            showStarring = document.getElementById("showStarring").value,
            showSynopsis = document.getElementById("showSynopsis").value,
            showRating = document.getElementById("showRating").value,
            showReleaseDate = document.getElementById("showReleaseDate").value,
            showRunningTime = document.getElementById("showRunningTime").value,
            showLastWatched = document.getElementById("showLastWatched").value,
            showImg = document.getElementById("addRecordShowImg").getAttribute("list").split(","),
            showFiles = Array.from(document.getElementById("showAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("showOtherGenres").value.split(",").map(elem => elem.trim()),
            genresLst = genreList("Show"),
            genres = [];
        // Check to see that a name was provided.
        if(showName != "") {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("showGenre" + genresLst[p]).checked);
            }
            const ogName = document.getElementById("showName").getAttribute("oldName"),
                oldTitle = ogName !== null ? ogName : showName;
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Show", showName, showAlternateName, showReview, showDirectors, showProducers, showWriters, showMusicians, showEditors,
                showCinematographers, showFiles, showDistributors, showProductionCompanies, showStarring, [genresLst, genres, otherGenres], showSynopsis, showRating, showReleaseDate, showRunningTime,
                showLastWatched, [document.getElementById("addRecordShowImg").getAttribute("list") == document.getElementById("addRecordShowImg").getAttribute("previous"), showImg], oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "A show record requires a name be provided.", "classes": "rounded"}); }
    });
};