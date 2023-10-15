/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page.

    - animeGenreList: Provides the list of all genres/tags that can be selected on the addRecord.html page for an anime record.
    - calculateAnimeRating: Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.
    - animeListReorganize: Reorganize the list items in the associated anime modal.
    - animeSeasonContentButtons: Listen for change and click events on the related content anime episode table items.
    - animeContentSingleButtons: Listen for click events on the related content anime film/ONA/OVA table items.
    - episodeAddition: Add an episode to an anime related content season.
    - animeContentSeasonButtons: Listen for click events on the related content anime season table items.
    - singleAddition: Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.
    - seasonAddition: Driver function designed to add a season table item in the related content section of an anime record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Provides the list of all genres/tags that can be selected on the addRecord.html page for an anime record.

*/
var animeGenreList = () => {
    return ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Mystery", "Magic",
            "MagicalSexShift", "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police",
            "PostApocalyptic", "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai",
            "School", "SciFi", "Seinen", "Shoujo", "Shounen", "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame",
            "SuperPower", "Supernatural", "Survival", "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy",
            "Vampire", "VideoGame", "War", "Western", "Workplace", "Yaoi", "Yuri"];
};



/*

Provides the list of all genres/tags that can be selected on the addRecord.html page for an anime record.

*/
var bookGenreList = () => {
    return ["Action", "Adventure", "Comedy", "Crime", "Dystopian", "Fantasy", "Fiction", "Historical", "Horror", "Mystery",
            "Mythology", "Nonfiction", "Romance", "Satire", "Sci-Fi", "Thriller", "Tragedy", "Western"];
};



/*

Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.

*/
var calculateAnimeRating = () => {
    // Define the related content list and global ratings input.
    const relevantList = document.getElementById("animeList"),
        globalRating = document.getElementById("animeRating");
    // Initialize the overall sum and count of items utilized in the sum.
    let sum = 0, count = 0;
    // Iterate through all related content items.
    for(let k = 0; k < relevantList.children.length; k++) {
        let itemType = relevantList.children[k].id.split("_")[2];
        // Pick out the required input based on whether the item is of a type single or season.
        if(itemType == "Single") {
            let singleValue = relevantList.children[k].children[0].children[4].children[0].children[3].value;
            if(singleValue != "") {
                sum += parseInt(singleValue);
                count++;
            }
        }
        else if(itemType == "Season") {
            let seasonValue = relevantList.children[k].children[0].children[4].children[0].value;
            if(seasonValue != "N/A") {
                sum += parseFloat(seasonValue);
                count++;
            }
        }
    }
    // Update the page global rating input accordingly.
    count == 0 ? globalRating.value = "N/A" : globalRating.value = (sum / count).toFixed(2);
};



/*

Reorganize the list items in the associated anime modal.

*/
var animeListReorganize = () => {
    // Define the related content list.
    const animeModalList = document.getElementById("animeList");
    // Iterate through all related content items.
    for(let i = 1; i < animeModalList.children.length + 1; i++) {
        // Define the associated components to the related content item.
        let child = animeModalList.children[i - 1],
            currentNum = child.id.split("_")[1],
            childType = child.id.split("_")[2],
            childHeader = child.children[0],
            childBody = child.children[1];
        // If the item is of type single then change the id and for attributes accordingly.
        if(childType == "Single" && parseInt(currentNum) != i) {
            let singleNameInput = childHeader.children[0].children[0],
                singleNameLabel = childHeader.children[0].children[1],
                singleTypeSelect = childHeader.children[1].children[0].children[3],
                singleReleaseInput = childHeader.children[2].children[0],
                singleReleaseLabel = childHeader.children[2].children[1],
                singleLastWatchedInput = childHeader.children[3].children[0],
                singleLastWatchedLabel = childHeader.children[3].children[1],
                singleRatingSelect = childHeader.children[4].children[0].children[3],
                singleReviewInput = childBody.children[0].children[0].children[0].children[0],
                singleReviewLabel = childBody.children[0].children[0].children[0].children[1];
            child.setAttribute("id", "li_" + i + "_Single");
            singleNameInput.setAttribute("id", "li_" + i + "_Single_Name");
            singleNameLabel.setAttribute("for", "li_" + i + "_Single_Name");
            singleTypeSelect.setAttribute("id", "li_" + i + "_Single_Type");
            singleReleaseInput.setAttribute("id", "li_" + i + "_Single_Release");
            singleReleaseLabel.setAttribute("for", "li_" + i + "_Single_Release");
            singleLastWatchedInput.setAttribute("id", "li_" + i + "_Single_LastWatched");
            singleLastWatchedLabel.setAttribute("for", "li_" + i + "_Single_LastWatched");
            singleRatingSelect.setAttribute("id", "li_" + i + "_Single_Rating");
            singleReviewInput.setAttribute("id", "li_" + i + "_Single_Review");
            singleReviewLabel.setAttribute("for", "li_" + i + "_Single_Review");
        }
        // If the item is of type season then change the id and for attributes accordingly.
        else if(childType == "Season") {
            let seasonNameInput = childHeader.children[0].children[0],
                seasonNameLabel = childHeader.children[0].children[1],
                seasonStartInput = childHeader.children[1].children[0],
                seasonStartLabel = childHeader.children[1].children[1],
                seasonEndInput = childHeader.children[2].children[0],
                seasonEndLabel = childHeader.children[2].children[1],
                seasonStatusSelect = childHeader.children[3].children[0].children[3],
                seasonAverageRatingInput = childHeader.children[4].children[0],
                seasonAverageRatingLabel = childHeader.children[4].children[1];
            child.setAttribute("id", "li_" + i + "_Season");
            seasonNameInput.setAttribute("id", "li_" + i + "_Season_Name");
            seasonNameLabel.setAttribute("for", "li_" + i + "_Season_Name");
            seasonStartInput.setAttribute("id", "li_" + i + "_Season_Start");
            seasonStartLabel.setAttribute("for", "li_" + i + "_Season_Start");
            seasonEndInput.setAttribute("id", "li_" + i + "_Season_End");
            seasonEndLabel.setAttribute("for", "li_" + i + "_Season_End");
            seasonStatusSelect.setAttribute("id", "li_" + i + "_Season_Status");
            seasonAverageRatingInput.setAttribute("id", "li_" + i + "_Season_AverageRating");
            seasonAverageRatingLabel.setAttribute("for", "li_" + i + "_Season_AverageRating");
            // Iterate through the season episodes and change the id and for attributes accordingly.
            for(let j = 1; j < childBody.children[0].children.length + 1; j++) {
                let episodeChild = childBody.children[0].children[j - 1],
                    episodeChildNameInput = episodeChild.children[0].children[0],
                    episodeChildNameLabel = episodeChild.children[0].children[1],
                    episodeChildLastWatchedInput = episodeChild.children[1].children[0],
                    episodeChildLastWatchedLabel = episodeChild.children[1].children[1],
                    episodeChildRatingSelect = episodeChild.children[2].children[0].children[3],
                    episodeChildReviewInput = episodeChild.children[3].children[0],
                    episodeChildReviewLabel = episodeChild.children[3].children[1];
                episodeChildNameInput.setAttribute("id", "li_" + i + "_Episode_Name_" + j);
                episodeChildNameLabel.setAttribute("for", "li_" + i + "_Episode_Name_" + j);
                episodeChildLastWatchedInput.setAttribute("id", "li_" + i + "_Episode_LastWatched_" + j);
                episodeChildLastWatchedLabel.setAttribute("for", "li_" + i + "_Episode_LastWatched_" + j);
                episodeChildRatingSelect.setAttribute("id", "li_" + i + "_Episode_Rating_" + j);
                episodeChildReviewInput.setAttribute("id", "li_" + i + "_Episode_Review_" + j);
                episodeChildReviewLabel.setAttribute("for", "li_" + i + "_Episode_Review_" + j);
            }
        }
    }
};



/*

Listen for change and click events on the related content anime episode table items.

    - ratingSelect is the input corresponding to the episode rating.
    - delButton is the button that deletes an episode.

*/
var animeSeasonContentButtons = (ratingSelect, delButton) => {
    // Listen for a change in the rating of an anime episode.
    ratingSelect.addEventListener("change", e => {
        // Calculate the new average of the anime season rating based on the ratings of the episodes.
        let selectIdArr = e.target.id.split("_"),
            seasonNum = selectIdArr[1],
            episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
            avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
        // Write the new rating average to the page.
        document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
    // Listen for a click on the delete button of an anime season episode.
    delButton.addEventListener("click", e => {
        let selectIdArr = e.target.parentNode.parentNode.parentNode.children[0].children[0].id.split("_"),
            seasonNum = selectIdArr[1],
            delTarget = e.target.parentNode.parentNode.parentNode;
        // Remove the tooltips.
        clearTooltips();
        // Remove the deleted episode.
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate the new average of the anime season rating based on the ratings of the episodes.
        let episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != "");
        // If the list of ratings available has at least one entry then define the average properly.
        if(episodesArrFiltered.length > 0) {
            let avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
        }
        // If there are no ratings available then set the season ratings average to the default value.
        else {
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = "N/A";
        }
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
};



/*

Listen for click events on the related content anime film/ONA/OVA table items.

    - formSingleName is the input corresponding to the film/ONA/OVA name.
    - formSingleReleaseDate is the input corresponding to the film/ONA/OVA release date.
    - formSingleLastWatchedDate is the input corresponding to the film/ONA/OVA last watched date.
    - formSingleRating is the input corresponding to the episode rating.
    - delSingleBtn is the button that deletes a film/ONA/OVA.

*/
var animeContentSingleButtons = (formSingleName, formSingleReleaseDate, formSingleLastWatchedDate, formSingleRating, delSingleBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formSingleName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleReleaseDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleLastWatchedDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a season on the anime associated modal to delete the season.
    delSingleBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
    // Listen for a change in the rating of a film/ONA/OVA.
    formSingleRating.addEventListener("change", e => {
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
};



/*

Add an episode to an anime related content season.

    - tgt is the document element corresponding to the season table item.

*/
var episodeAddition = tgt => {
    // Remove the tooltips.
    clearTooltips();
    // Define the list item id.
    const addTargetNum = tgt.id.split("_")[1];
    tgt.classList.remove("active");
    // Define and construct all components needed to attach an anime season episode to the related content table.
    const rowDiv = document.createElement("div"),
        seasonEpisodeNameDiv = document.createElement("span"),
        seasonEpisodeNameLabel = document.createElement("label"),
        seasonEpisodeNameInput = document.createElement("input"),
        seasonEpisodeLastWatchedDiv = document.createElement("div"),
        seasonEpisodeLastWatchedInput = document.createElement("input"),
        seasonEpisodeLastWatchedLabel = document.createElement("label"),
        seasonEpisodeRatingDiv = document.createElement("div"),
        seasonEpisodeRatingSelect = document.createElement("select"),
        seasonEpisodeRatingLabel = document.createElement("label"),
        seasonEpisodeRatingDefOption = document.createElement("option"),
        seasonEpisodeReviewDiv = document.createElement("span"),
        seasonEpisodeReviewLabel = document.createElement("label"),
        seasonEpisodeReviewInput = document.createElement("textarea"),
        seasonEpisodeDeleteDiv = document.createElement("div"),
        seasonEpisodeDeleteSpan = document.createElement("span"),
        seasonEpisodeDeleteIcon = document.createElement("i");
    // Prepare the season episode name.
    seasonEpisodeNameInput.setAttribute("type", "text");
    seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameInput.classList.add("validate", "left");
    seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameLabel.textContent = "Episode Name:";
    seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode last watched date.
    seasonEpisodeLastWatchedInput.classList.add("validate", "left");
    seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_Episode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedInput.setAttribute("type", "date");
    seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
    seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode rating.
    seasonEpisodeRatingDefOption.setAttribute("value", "");
    seasonEpisodeRatingDefOption.setAttribute("selected", "true");
    seasonEpisodeRatingDefOption.textContent = "N/A";
    seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_Episode_Rating_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeRatingSelect.append(seasonEpisodeRatingDefOption);
    for(let t = 0; t < 11; t++) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", t);
        newOption.textContent = t + "/10";
        seasonEpisodeRatingSelect.append(newOption);
    }
    seasonEpisodeRatingLabel.textContent = "Rating:";
    seasonEpisodeRatingDiv.classList.add("input-field", "col", "s2", "selectShortVerticalScroll");
    // Prepare the season episode review.
    seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
    seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewLabel.textContent = "Comments/Review:";
    seasonEpisodeReviewDiv.classList.add("input-field", "col", "s5");
    // Prepare the season episode button for deleting the episode.
    seasonEpisodeDeleteDiv.classList.add("input-field", "col", "s1", "modalContentEpisodeDelete");
    seasonEpisodeDeleteSpan.classList.add("center", "tooltipped");
    seasonEpisodeDeleteSpan.setAttribute("data-position", "top");
    seasonEpisodeDeleteSpan.setAttribute("data-tooltip", "Delete");
    seasonEpisodeDeleteSpan.classList.add("modalContentDelete");
    seasonEpisodeDeleteIcon.textContent = "delete";
    seasonEpisodeDeleteIcon.classList.add("material-icons", "modalContentEpisodeDeleteIcon");
    // Attach all season episodes components to the form item.
    rowDiv.classList.add("row");
    seasonEpisodeNameDiv.append(seasonEpisodeNameInput, seasonEpisodeNameLabel);
    seasonEpisodeLastWatchedDiv.append(seasonEpisodeLastWatchedInput, seasonEpisodeLastWatchedLabel);
    seasonEpisodeRatingDiv.append(seasonEpisodeRatingSelect, seasonEpisodeRatingLabel);
    seasonEpisodeReviewDiv.append(seasonEpisodeReviewInput, seasonEpisodeReviewLabel);
    seasonEpisodeDeleteSpan.append(seasonEpisodeDeleteIcon);
    seasonEpisodeDeleteDiv.append(seasonEpisodeDeleteSpan);
    rowDiv.append(seasonEpisodeNameDiv, seasonEpisodeLastWatchedDiv, seasonEpisodeRatingDiv, seasonEpisodeReviewDiv, seasonEpisodeDeleteDiv);
    // Attach the form item to the page modal.
    tgt.children[1].children[0].append(rowDiv);
    // Initialize the select tags.
    initSelect();
    // Initialize the tooltips.
    initTooltips();
    // Initialize the observers for all relevant select tags.
    initSelectObservers();
    // Add the button listeners associated to an anime season episode.
    animeSeasonContentButtons(seasonEpisodeRatingSelect, seasonEpisodeDeleteIcon);
};



/*

Listen for click events on the related content anime season table items.

    - formName is the input corresponding to the season name.
    - formStartDate is the input corresponding to the season start date.
    - formEndDate is the input corresponding to the season end date.
    - formAverageRating is the input corresponding to the season average rating.
    - addBtn is the button that adds a season episode.
    - delBtn is the button that deletes a season.

*/
var animeContentSeasonButtons = (formName, formStartDate, formEndDate, formAverageRating, addBtn, delBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formStartDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formEndDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formAverageRating.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a season on the anime associated modal to delete the season.
    delBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
    // Listen for a click event on the add button for a season on the anime associated modal to add an episode listing.
    addBtn.addEventListener("click", e => {
        // Add an episode to the associated anime.
        episodeAddition(e.target.parentNode.parentNode.parentNode.parentNode);
    });
};



/*

Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.

*/
var singleAddition = () => {
    // Remove the tooltips.
    clearTooltips();
    // Define and construct all components needed to attach an anime film to the related content table.
    const animeList = document.getElementById("animeList"),
        itemSingleLI = document.createElement("li"),
        itemSingleDivHeader = document.createElement("div"),
        divSingleName = document.createElement("div"),
        inputSingleName = document.createElement("input"),
        labelSingleName = document.createElement("label"),
        divSingleType = document.createElement("div"),
        selectSingleType = document.createElement("select"),
        option1SingleType = document.createElement("option"),
        option2SingleType = document.createElement("option"),
        option3SingleType = document.createElement("option"),
        option4SingleType = document.createElement("option"),
        option5SingleType = document.createElement("option"),
        labelSingleType = document.createElement("label"),
        divSingleReleaseDate = document.createElement("div"),
        inputSingleReleaseDate = document.createElement("input"),
        labelSingleReleaseDate = document.createElement("label"),
        divSingleLastWatchedDate = document.createElement("div"),
        inputSingleLastWatchedDate = document.createElement("input"),
        labelSingleLastWatchedDate = document.createElement("label"),
        divSingleRating = document.createElement("div"),
        selectSingleRating = document.createElement("select"),
        labelSingleRating = document.createElement("label"),
        defOptionSingleRating = document.createElement("option"),
        divSingleDelete = document.createElement("div"),
        spanSingleDelete = document.createElement("span"),
        iconSingleDelete = document.createElement("i"),
        itemSingleDivBody = document.createElement("div"),
        itemSingleDivBodyForm = document.createElement("form"),
        divSingleReview = document.createElement("div"),
        spanSingleReview = document.createElement("span"),
        inputSingleReview = document.createElement("textarea"),
        labelSingleReview = document.createElement("label");
    // Prepare the film/ONA/OVA name.
    divSingleName.classList.add("input-field");
    divSingleName.style.width = "20%";
    inputSingleName.classList.add("validate", "left");
    inputSingleName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Name");
    inputSingleName.setAttribute("type", "text");
    labelSingleName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Name");
    labelSingleName.textContent = "Name:";
    // Prepare the season status.
    divSingleType.classList.add("input-field");
    divSingleType.style.width = "17.5%";
    divSingleType.style.marginLeft = "25px";
    option1SingleType.setAttribute("value", "");
    option1SingleType.textContent = "N/A";
    option2SingleType.setAttribute("value", "Movie");
    option2SingleType.textContent = "Movie";
    option3SingleType.setAttribute("value", "ONA");
    option3SingleType.textContent = "ONA";
    option4SingleType.setAttribute("value", "OVA");
    option4SingleType.textContent = "OVA";
    option5SingleType.setAttribute("value", "Special");
    option5SingleType.textContent = "Special";
    selectSingleType.append(option1SingleType, option2SingleType, option3SingleType, option4SingleType, option5SingleType);
    selectSingleType.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Type");
    labelSingleType.textContent = "Type:";
    // Prepare the film/ONA/OVA release date.
    divSingleReleaseDate.classList.add("input-field");
    divSingleReleaseDate.style.width = "20%";
    divSingleReleaseDate.style.marginLeft = "25px";
    inputSingleReleaseDate.classList.add("validate", "left");
    inputSingleReleaseDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Release");
    inputSingleReleaseDate.setAttribute("type", "date");
    labelSingleReleaseDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Release");
    labelSingleReleaseDate.textContent = "Release Date:";
    // Prepare the film/ONA/OVA last watched date.
    divSingleLastWatchedDate.classList.add("input-field");
    divSingleLastWatchedDate.style.width = "20%";
    divSingleLastWatchedDate.style.marginLeft = "25px";
    inputSingleLastWatchedDate.classList.add("validate", "left");
    inputSingleLastWatchedDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
    inputSingleLastWatchedDate.setAttribute("type", "date");
    labelSingleLastWatchedDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
    labelSingleLastWatchedDate.textContent = "Last Watched Date:";
    // Prepare the film/ONA/OVA rating.
    divSingleRating.classList.add("input-field", "selectShortVerticalScroll");
    divSingleRating.style.width = "17.5%";
    divSingleRating.style.marginLeft = "25px";
    defOptionSingleRating.setAttribute("value", "");
    defOptionSingleRating.setAttribute("selected", "true");
    defOptionSingleRating.textContent = "N/A";
    selectSingleRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Rating");
    selectSingleRating.append(defOptionSingleRating);
    for(let t = 0; t < 11; t++) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", t);
        newOption.textContent = t + "/10";
        selectSingleRating.append(newOption);
    }
    labelSingleRating.textContent = "Rating:";
    // Prepare the season button for deleting the season.
    divSingleDelete.classList.add("input-field");
    divSingleDelete.style.width = "5%";
    divSingleDelete.style.marginLeft = "25px";
    spanSingleDelete.classList.add("center", "tooltipped");
    spanSingleDelete.setAttribute("data-position", "top");
    spanSingleDelete.setAttribute("data-tooltip", "Delete");
    spanSingleDelete.classList.add("modalContentButtons", "modalContentDelete");
    iconSingleDelete.textContent = "delete_sweep";
    iconSingleDelete.classList.add("material-icons");
    // Prepare the film/ONA/OVA review.
    divSingleReview.classList.add("row");
    spanSingleReview.classList.add("input-field", "col", "s12");
    inputSingleReview.classList.add("validate", "materialize-textarea");
    inputSingleReview.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Review");
    labelSingleReview.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Review");
    labelSingleReview.textContent = "Comments/Review:";
    // Attach all season components to the list item.
    itemSingleDivHeader.classList.add("collapsible-header");
    itemSingleDivBody.classList.add("collapsible-body");
    divSingleName.append(inputSingleName, labelSingleName);
    divSingleType.append(selectSingleType, labelSingleType);
    divSingleReleaseDate.append(inputSingleReleaseDate, labelSingleReleaseDate);
    divSingleLastWatchedDate.append(inputSingleLastWatchedDate, labelSingleLastWatchedDate);
    divSingleRating.append(selectSingleRating, labelSingleRating);
    spanSingleReview.append(inputSingleReview, labelSingleReview);
    divSingleReview.append(spanSingleReview);
    spanSingleDelete.append(iconSingleDelete);
    divSingleDelete.append(spanSingleDelete);
    itemSingleDivHeader.append(divSingleName, divSingleType, divSingleReleaseDate, divSingleLastWatchedDate, divSingleRating, divSingleDelete);
    // Attach the div designed to house the film/ONA/OVA review.
    itemSingleDivBodyForm.classList.add("col", "s12");
    itemSingleDivBodyForm.append(divSingleReview);
    itemSingleDivBody.append(itemSingleDivBodyForm);
    // Attach the list item to the page modal.
    itemSingleLI.setAttribute("draggable", "true");
    itemSingleLI.classList.add("dropzone");
    itemSingleLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single");
    itemSingleLI.append(itemSingleDivHeader, itemSingleDivBody);
    animeList.append(itemSingleLI);
    // Add the button listeners associated to a film/ONA/OVA.
    animeContentSingleButtons(inputSingleName, inputSingleReleaseDate, inputSingleLastWatchedDate, selectSingleRating, iconSingleDelete);
    // Initialize the select tags.
    initSelect();
    // Initialize the tooltips.
    initTooltips();
    // Initialize the observers for all relevant select tags.
    initSelectObservers();
};



/*

Driver function designed to add a season table item in the related content section of an anime record.

*/
var seasonAddition = () => {
    // Remove the tooltips.
    clearTooltips();
    // Define and construct all components needed to attach an anime season to the related content table.
    const animeList = document.getElementById("animeList"),
        itemLI = document.createElement("li"),
        itemDivHeader = document.createElement("div"),
        divName = document.createElement("div"),
        inputName = document.createElement("input"),
        labelName = document.createElement("label"),
        divStartDate = document.createElement("div"),
        inputStartDate = document.createElement("input"),
        labelStartDate = document.createElement("label"),
        divEndDate = document.createElement("div"),
        inputEndDate = document.createElement("input"),
        labelEndDate = document.createElement("label"),
        divStatus = document.createElement("div"),
        selectStatus = document.createElement("select"),
        option1Status = document.createElement("option"),
        option2Status = document.createElement("option"),
        option3Status = document.createElement("option"),
        option4Status = document.createElement("option"),
        option5Status = document.createElement("option"),
        option6Status = document.createElement("option"),
        labelStatus = document.createElement("label"),
        divAverageRating = document.createElement("div"),
        inputAverageRating = document.createElement("input"),
        labelAverageRating = document.createElement("label"),
        divAdd = document.createElement("div"),
        spanAdd = document.createElement("span"),
        iconAdd = document.createElement("i"),
        divDelete = document.createElement("div"),
        spanDelete = document.createElement("span"),
        iconDelete = document.createElement("i"),
        itemDivBody = document.createElement("div"),
        itemDivBodyForm = document.createElement("form");
    // Prepare the season name.
    divName.classList.add("input-field");
    divName.style.width = "17%";
    inputName.classList.add("validate", "left");
    inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Name");
    inputName.setAttribute("type", "text");
    labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Name");
    labelName.textContent = "Season Name:";
    // Prepare the season start date.
    divStartDate.classList.add("input-field");
    divStartDate.style.width = "15%";
    divStartDate.style.marginLeft = "25px";
    inputStartDate.classList.add("validate", "left");
    inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Start");
    inputStartDate.setAttribute("type", "date");
    labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Start");
    labelStartDate.textContent = "Season Start Date:";
    // Prepare the season end date.
    divEndDate.classList.add("input-field");
    divEndDate.style.width = "15%";
    divEndDate.style.marginLeft = "25px";
    inputEndDate.classList.add("validate", "left");
    inputEndDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_End");
    inputEndDate.setAttribute("type", "date");
    labelEndDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_End");
    labelEndDate.textContent = "Season End Date:";
    // Prepare the season status.
    divStatus.classList.add("input-field");
    divStatus.style.width = "15%";
    divStatus.style.marginLeft = "25px";
    option1Status.setAttribute("value", "");
    option1Status.textContent = "N/A";
    option2Status.setAttribute("value", "Watching");
    option2Status.textContent = "Watching";
    option3Status.setAttribute("value", "Completed");
    option3Status.textContent = "Completed";
    option4Status.setAttribute("value", "On-Hold");
    option4Status.textContent = "On-Hold";
    option5Status.setAttribute("value", "Dropped");
    option5Status.textContent = "Dropped";
    option6Status.setAttribute("value", "Plan To Watch");
    option6Status.textContent = "Plan To Watch";
    selectStatus.append(option1Status, option2Status, option3Status, option4Status, option5Status, option6Status);
    selectStatus.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Status");
    labelStatus.textContent = "Status:";
    // Prepare the season average rating.
    divAverageRating.classList.add("input-field");
    divAverageRating.style.width = "13%";
    divAverageRating.style.marginLeft = "25px";
    inputAverageRating.classList.add("left");
    inputAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
    inputAverageRating.setAttribute("type", "text");
    inputAverageRating.readOnly = "true";
    inputAverageRating.value = "N/A";
    labelAverageRating.classList.add("active");
    labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
    labelAverageRating.textContent = "Average Rating:";
    // Prepare the season button for adding an episode.
    divAdd.classList.add("input-field");
    divAdd.style.width = "5%";
    divAdd.style.marginLeft = "25px";
    spanAdd.classList.add("center", "tooltipped");
    spanAdd.setAttribute("data-position", "top");
    spanAdd.setAttribute("data-tooltip", "+ Episode");
    spanAdd.classList.add("modalContentButtons", "modalContentAdd");
    iconAdd.textContent = "add";
    iconAdd.classList.add("material-icons");
    iconAdd.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AddEpisode")
    // Prepare the season button for deleting the season.
    divDelete.classList.add("input-field");
    divDelete.style.width = "5%";
    divDelete.style.marginLeft = "25px";
    spanDelete.classList.add("center", "tooltipped");
    spanDelete.setAttribute("data-position", "top");
    spanDelete.setAttribute("data-tooltip", "Delete");
    spanDelete.classList.add("modalContentButtons", "modalContentDelete");
    iconDelete.textContent = "delete_sweep";
    iconDelete.classList.add("material-icons");
    // Attach all season components to the list item.
    itemDivHeader.classList.add("collapsible-header");
    itemDivBody.classList.add("collapsible-body");
    divName.append(inputName, labelName);
    divStartDate.append(inputStartDate, labelStartDate);
    divEndDate.append(inputEndDate, labelEndDate);
    divAverageRating.append(inputAverageRating, labelAverageRating);
    spanAdd.append(iconAdd);
    divAdd.append(spanAdd);
    spanDelete.append(iconDelete);
    divDelete.append(spanDelete);
    divStatus.append(selectStatus, labelStatus);
    itemDivHeader.append(divName, divStartDate, divEndDate, divStatus, divAverageRating, divAdd, divDelete);
    // Attach the div designed to house all season episodes.
    itemDivBodyForm.classList.add("col", "s12");
    itemDivBody.append(itemDivBodyForm);
    // Attach the list item to the page modal.
    itemLI.setAttribute("draggable", "true");
    itemLI.classList.add("dropzone");
    itemLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season");
    itemLI.append(itemDivHeader, itemDivBody);
    animeList.append(itemLI);
    // Add the button listeners associated to an anime season.
    animeContentSeasonButtons(inputName, inputStartDate, inputEndDate, inputAverageRating, iconAdd, iconDelete);
    // Initialize the select tags.
    initSelect();
    // Initialize the tooltips.
    initTooltips();
    // Initialize the observers for all relevant select tags.
    initSelectObservers();
};