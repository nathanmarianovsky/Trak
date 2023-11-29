/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on film records.

    - filmSave: Processes the information required to save a film record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a film record.

*/
var filmSave = () => {
    // // Define the page save button.
    // const animeSaveBtn = document.getElementById("animeSave");
    // // Listen for a click on the save button.
    // animeSaveBtn.addEventListener("click", e => {
    //     e.preventDefault();
    //     // Define the page components which will contain all associated details.
    //     const animeList = document.getElementById("animeList"),
    //         animeName = document.getElementById("animeName").value,
    //         animeJapaneseName = document.getElementById("animeJapaneseName").value,
    //         animeReview = document.getElementById("animeReview").value,
    //         animeDirectors = document.getElementById("animeDirectors").value,
    //         animeProducers = document.getElementById("animeProducers").value,
    //         animeWriters = document.getElementById("animeWriters").value,
    //         animeMusicians = document.getElementById("animeMusicians").value,
    //         animeStudio = document.getElementById("animeStudio").value,
    //         animeLicense = document.getElementById("animeLicense").value,
    //         animeSynopsis = document.getElementById("animeSynopsis").value,
    //         animeImg = document.getElementById("addRecordAnimeImg").getAttribute("list").split(","),
    //         animeFiles = Array.from(document.getElementById("animeAddRecordFiles").files).map(elem => elem.path),
    //         otherGenres = document.getElementById("animeOtherGenres").value.split(",").map(elem => elem.trim()),
    //         genresLst = genreList("Anime"),
    //         genres = [],
    //         content = [];
    //     // Check to see that at least one name was provided.
    //     if(animeName != "" || animeJapaneseName != "") {
    //         // Save all information about the genres.
    //         for(let p = 0; p < genresLst.length; p++) {
    //             genres.push(document.getElementById("animeGenre" + genresLst[p]).checked);
    //         }
    //         // For each table item in the related content table process the associated information.
    //         for(let q = 1; q < animeList.children.length + 1; q++) {
    //             let animeListChild = animeList.children[q - 1],
    //                 animeListChildCondition = animeListChild.id.split("_")[2],
    //                 curContent = [];
    //             // Attain the details on a film/ONA/OVA.
    //             if(animeListChildCondition == "Single") {
    //                 let singleName = document.getElementById("li_" + q + "_Single_Name").value,
    //                     singleType = document.getElementById("li_" + q + "_Single_Type").value,
    //                     singleRelease = document.getElementById("li_" + q + "_Single_Release").value,
    //                     singleLastWatched = document.getElementById("li_" + q + "_Single_LastWatched").value,
    //                     singleRating = document.getElementById("li_" + q + "_Single_Rating").value,
    //                     singleReview = document.getElementById("li_" + q + "_Single_Review").value;
    //                 curContent.push("Single", singleName, singleType, singleRelease, singleLastWatched, singleRating, singleReview);
    //             }
    //             // Attain the details on a season and its episodes.
    //             else if(animeListChildCondition == "Season") {
    //                 let seasonName = document.getElementById("li_" + q + "_Season_Name").value,
    //                     seasonStart = document.getElementById("li_" + q + "_Season_Start").value,
    //                     seasonEnd = document.getElementById("li_" + q + "_Season_End").value,
    //                     seasonStatus = document.getElementById("li_" + q + "_Season_Status").value,
    //                     seasonEpisodes = [];
    //                 for(let r = 1; r < animeListChild.children[1].children[0].children.length + 1; r++) {
    //                     let seasonEpisodeName = document.getElementById("li_" + q + "_Episode_Name_" + r).value,
    //                         seasonEpisodeLastWatched = document.getElementById("li_" + q + "_Episode_LastWatched_" + r).value,
    //                         seasonEpisodeRating = document.getElementById("li_" + q + "_Episode_Rating_" + r).value,
    //                         seasonEpisodeReview = document.getElementById("li_" + q + "_Episode_Review_" + r).value;
    //                     seasonEpisodes.push([seasonEpisodeName, seasonEpisodeLastWatched, seasonEpisodeRating, seasonEpisodeReview]);
    //                 }
    //                 curContent.push("Season", seasonName, seasonStart, seasonEnd, seasonStatus, seasonEpisodes);
    //             }
    //             // Push the table item information into the array holding all related content details.
    //             content.push(curContent);
    //         }
    //         const ogName = document.getElementById("animeName").getAttribute("oldName"),
    //             oldTitle = ogName !== null ? ogName : animeName;
    //         // Send the request to the back-end portion of the app.
    //         const submissionMaterial = ["Anime", animeName, animeJapaneseName, animeReview, animeDirectors, animeProducers, animeWriters,
    //             animeMusicians, animeStudio, animeLicense, animeFiles, [genresLst, genres, otherGenres], content, animeSynopsis,
    //             [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), animeImg], oldTitle];
    //         ipcRenderer.send("performSave", submissionMaterial);
    //     }
    //     // If no name has been provided then notify the user.
    //     else { M.toast({"html": "An anime record requires that either an English or Japanese name is provided.", "classes": "rounded"}); }
    // });
};