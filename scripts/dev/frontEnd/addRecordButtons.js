/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



/*

Remove all tooltips on the page.

*/
var clearTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Destroy each tooltip.
    for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }
};



/*

Initialize all tooltips on the page.

*/
var initTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
};



/*

Initialize all select tags on the page.

*/
var initSelect = () => {
    // Define the current instances of select tags fonud on the page.
    let elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
};



/*

Initialize the listeners associated to related content dragging.

*/
var initContentDrag = () => {
    // Define the variables associated to the drag action.
    let dragged = "", id = 0, index = 0, indexDrop = 0, list = [];
    // Listen for the start of a drag event on the related content.
    document.addEventListener("dragstart", ({target}) => {
        // If the target does not correspond to the necessary li container, then switch it accordingly.
        if(target.nodeName != "LI") { target = target.closest(".dropzone"); }
        dragged = target;
        id = target.id.split("_")[1];
        list = target.parentNode.children;
        for(let i = 0; i < list.length; i += 1) {
            if(list[i] === dragged){ index = i; }
        }
    });
    // Prevent the default action duruing a drag over.
    document.addEventListener("dragover", (event) => { event.preventDefault(); });
    // Listen for the end of a drag event on the related content.
    document.addEventListener("drop", ({target}) => {
        // If the target does not correspond to the necessary li container, then switch it accordingly.
        if(target.nodeName != "LI") { target = target.closest(".dropzone"); }
        if(target.className == "dropzone" && target.id.split("_")[1] !== id) {
            dragged.remove(dragged);
            for(let i = 0; i < list.length; i += 1) {
                if(list[i] === target) { indexDrop = i; }
            }
            index > indexDrop ? target.before(dragged) : target.after(dragged);
        }
    });
};



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Define the buttons for all actions.
    const categoryAnime = document.getElementById("categoryAnime"),
        animeAddFilm = document.getElementById("animeAddFilm"),
        animeAddSeason = document.getElementById("animeAddSeason");
    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv");
    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        if(directionsTitle.style.display != "none") {
            directionsTitle.style.display = "none";
            directionsText.style.display = "none";
        }
        else if(!categoryAnime.parentNode.classList.contains("active")) {
            categoryDivs.style.display = "none";
        }
        categoryAnimeDiv.style.display = "initial";
        categoryAnime.parentNode.classList.add("active");
    });
    // Listen for a click event on the animeAddSeason button on the anime associated modal to add a season listing.
    animeAddSeason.addEventListener("click", e => {
        // Remove the tooltips.
        clearTooltips();

        const animeList = document.getElementById("animeList");
        let itemLI = document.createElement("li"),
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
        divName.classList.add("input-field");
        divName.style.width = "17%";
        inputName.classList.add("validate", "center");
        inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Name");
        inputName.setAttribute("type", "text");
        labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Name");
        labelName.textContent = "Season Name:";
        divStartDate.classList.add("input-field");
        divStartDate.style.width = "15%";
        divStartDate.style.marginLeft = "25px";
        inputStartDate.classList.add("validate", "center");
        inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Start");
        inputStartDate.setAttribute("type", "date");
        labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Start");
        labelStartDate.textContent = "Season Start Date:";
        divEndDate.classList.add("input-field");
        divEndDate.style.width = "15%";
        divEndDate.style.marginLeft = "25px";
        inputEndDate.classList.add("validate", "center");
        inputEndDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_End");
        inputEndDate.setAttribute("type", "date");
        labelEndDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_End");
        labelEndDate.textContent = "Season End Date:";

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
        labelStatus.textContent = "Status:";

        divAverageRating.classList.add("input-field");
        divAverageRating.style.width = "13%";
        divAverageRating.style.marginLeft = "25px";
        inputAverageRating.classList.add("center");
        inputAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
        inputAverageRating.setAttribute("type", "text");
        inputAverageRating.readOnly = "true";
        inputAverageRating.value = "N/A";
        labelAverageRating.classList.add("active");
        labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
        labelAverageRating.textContent = "Average Rating:";

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

        divDelete.classList.add("input-field");
        divDelete.style.width = "5%";
        divDelete.style.marginLeft = "25px";
        spanDelete.classList.add("center", "tooltipped");
        spanDelete.setAttribute("data-position", "top");
        spanDelete.setAttribute("data-tooltip", "Delete");
        spanDelete.classList.add("modalContentButtons", "modalContentDelete");
        iconDelete.textContent = "delete_sweep";
        iconDelete.classList.add("material-icons");

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

        itemDivBodyForm.classList.add("col", "s12");
        itemDivBody.append(itemDivBodyForm);


        itemLI.setAttribute("draggable", "true");
        itemLI.classList.add("dropzone");
        itemLI.setAttribute("id", "li_" + (animeList.children.length + 1));
        itemLI.append(itemDivHeader, itemDivBody);
        animeList.append(itemLI);

        inputName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        inputStartDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        inputEndDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        // divAverageRating.addEventListener("click", e => e.target.parentNode.parentNode.children[1].style.display = "none");
        inputAverageRating.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
        iconDelete.addEventListener("click", e => { 
            let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
            setTimeout(() => delTarget.children[1].style.display = "none", 1);
            // Remove the tooltips.
            clearTooltips();
            delTarget.remove();
            // Initialize the tooltips.
            initTooltips();
        });
        iconAdd.addEventListener("click", e => {
            // Remove the tooltips.
            clearTooltips();

            let addTarget = e.target.parentNode.parentNode.parentNode.parentNode,
                addTargetNum = e.target.id.split("_")[1];
            addTarget.classList.remove("active");
            let rowDiv = document.createElement("div"),
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
            seasonEpisodeNameInput.setAttribute("type", "text");
            seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Name_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeNameInput.classList.add("validate", "center");
            seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Name_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeNameLabel.textContent = "Episode Name:";
            seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeLastWatchedInput.classList.add("validate", "center");
            seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_Episode_LastWatched_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeLastWatchedInput.setAttribute("type", "date");
            seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_LastWatched_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
            seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeRatingDefOption.setAttribute("value", "");
            seasonEpisodeRatingDefOption.setAttribute("selected", "true");
            seasonEpisodeRatingDefOption.textContent = "N/A";
            seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_Episode_Rating_" + (addTarget.children[1].children[0].children.length + 1))
            seasonEpisodeRatingSelect.append(seasonEpisodeRatingDefOption);
            for(let t = 0; t < 11; t++) {
                let newOption = document.createElement("option");
                newOption.setAttribute("value", t);
                newOption.textContent = t + "/10";
                seasonEpisodeRatingSelect.append(newOption);
            }
            seasonEpisodeRatingLabel.textContent = "Rating:";
            seasonEpisodeRatingDiv.classList.add("input-field", "col", "s2");

            seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Review_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
            seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Review_" + (addTarget.children[1].children[0].children.length + 1));
            seasonEpisodeReviewLabel.textContent = "Review:";
            seasonEpisodeReviewDiv.classList.add("input-field", "col", "s5");

            seasonEpisodeDeleteDiv.classList.add("input-field", "col", "s1", "modalContentEpisodeDelete");
            seasonEpisodeDeleteSpan.classList.add("center", "tooltipped");
            seasonEpisodeDeleteSpan.setAttribute("data-position", "top");
            seasonEpisodeDeleteSpan.setAttribute("data-tooltip", "Delete");
            seasonEpisodeDeleteSpan.classList.add("modalContentDelete");
            seasonEpisodeDeleteIcon.textContent = "delete";
            seasonEpisodeDeleteIcon.classList.add("material-icons", "modalContentEpisodeDeleteIcon");

            rowDiv.classList.add("row");
            seasonEpisodeNameDiv.append(seasonEpisodeNameInput, seasonEpisodeNameLabel);
            seasonEpisodeLastWatchedDiv.append(seasonEpisodeLastWatchedInput, seasonEpisodeLastWatchedLabel);
            seasonEpisodeRatingDiv.append(seasonEpisodeRatingSelect, seasonEpisodeRatingLabel);
            seasonEpisodeReviewDiv.append(seasonEpisodeReviewInput, seasonEpisodeReviewLabel);
            seasonEpisodeDeleteSpan.append(seasonEpisodeDeleteIcon);
            seasonEpisodeDeleteDiv.append(seasonEpisodeDeleteSpan);
            rowDiv.append(seasonEpisodeNameDiv, seasonEpisodeLastWatchedDiv, seasonEpisodeRatingDiv, seasonEpisodeReviewDiv, seasonEpisodeDeleteDiv);
            addTarget.children[1].children[0].append(rowDiv);

            // Initialize the select tags.
            initSelect();
            // Initialize the tooltips.
            initTooltips();

            seasonEpisodeRatingSelect.addEventListener("change", e => {
                let selectIdArr = e.target.id.split("_"),
                    seasonNum = selectIdArr[1],
                    episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
                    episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
                    avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
                document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
            });

            seasonEpisodeDeleteIcon.addEventListener("click", e => {
                let delTarget = e.target.parentNode.parentNode.parentNode;
                // Remove the tooltips.
                clearTooltips();
                delTarget.remove();
                // Initialize the tooltips.
                initTooltips();
            });

        });
        // labelAverageRating.addEventListener("click", e => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none");

        // Initialize the select tags.
        initSelect();
        // Initialize the tooltips.
        initTooltips();

        let observer = new MutationObserver(mutations => {
            let target = mutations[0].target.parentNode.parentNode.parentNode.parentNode;
            setTimeout(() => target.children[1].style.display = "none", 1);
        });

        let lst = document.querySelectorAll(".modal .dropdown-content");
        for(let i = 0; i < lst.length; i++) {
            observer.observe(lst[i], { "attributes": true, "attributeFilter": ["style"] });
        }

        initContentDrag();
    });
});