/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - clearTooltips: Remove all tooltips on the page.
    - initTooltips: Initialize all tooltips on the page.
    - initSelect: Initialize all select tags on the page.
    - initSelectObservers: Initialize the observers for style mutations on related content select tags.
    - initContentDrag: Initialize the listeners associated to related content dragging.
    - animeListReorganize: Reorganize the list items in the associated anime modal.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



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

Initialize the observers for style mutations on related content select tags.

*/
var initSelectObservers = () => {
    // Define the select tags observer.
    let observer = new MutationObserver(mutations => {
        // Define the listed item target in the unordered list.
        let target = mutations[0].target.parentNode.parentNode.parentNode.parentNode;
        // If this select tag is a desired target then hide the body of episodes associated to an anime season.
        if(target.classList.contains("dropzone")) {
            setTimeout(() => target.children[1].style.display = "none", 1);
        }
    });
    // Define the list of all relevant select tags on the modal.
    let lst = document.querySelectorAll(".modal .dropdown-content");
    // For each relevant select tag tell the observer to watch for changes.
    for(let i = 0; i < lst.length; i++) {
        observer.observe(lst[i], { "attributes": true, "attributeFilter": ["style"] });
    }
};



/*

Initialize the observer for style mutations on the anime review.

*/
var initAnimeReviewObserver = () => {
    // Define the select tags observer.
    let observer = new MutationObserver(mutations => {
        // Define the item target on the page.
        let trgt = mutations[0].target;
        // If the height of the textarea is extended then display the vertical scroll bar.
        trgt.style.height == "45px" ? document.body.style.overflowY = "hidden" : document.body.style.overflowY = "visible";
    });
    // Define the anime review input.
    let animeReview = document.getElementById("animeReview");
    // Tell the observer to watch for changes.
    observer.observe(animeReview, { "attributes": true, "attributeFilter": ["style"] });
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
        // Reoganize the ids of the modal list items.
        animeListReorganize();
    });
};



/*

Reorganize the list items in the associated anime modal.

*/
var animeListReorganize = () => {
    const animeModalList = document.getElementById("animeList");
    for(let i = 1; i < animeModalList.children.length + 1; i++) {
        let child = animeModalList.children[i - 1],
            currentNum = child.id.split("_")[1],
            childType = child.id.split("_")[2],
            childHeader = child.children[0],
            childBody = child.children[1];
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



var calculateAnimeRating = () => {
    const relevantList = document.getElementById("animeList"),
        globalRating = document.getElementById("animeRating");
    let sum = 0, count = 0;
    for(let k = 0; k < relevantList.children.length; k++) {
        let itemType = relevantList.children[k].id.split("_")[2];
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
    if(count == 0) { globalRating.setAttribute("value", "N/A"); }
    else { globalRating.setAttribute("value", (sum / count).toFixed(2)); }
};