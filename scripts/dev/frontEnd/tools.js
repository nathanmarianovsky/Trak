/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - clearTooltips: Remove all tooltips on the page.
    - initTooltips: Initialize all tooltips on the page.
    - initSelect: Initialize all select tags on the page.
    - initModal: Initialize all modals on the page.
    - initSelectObservers: Initialize the observers for style mutations on related content select tags.
    - initContentDrag: Initialize the listeners associated to related content dragging.
    - toastParse: Handles the parsing of a record folder name to display to the user.

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

Initialize all modals on the page.

*/
var initModal = () => {
    // Define the current instances of modals fonud on the page.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal);
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

Handles the parsing of a record folder name to display to the user.

    - folder is the string representing the name of the folder associated to a record.

*/
var toastParse = folder => {
    let hldr = folder.split("-")[0];
    return nameStr = hldr.toLowerCase() + " " + folder.substring(hldr.length + 1);
};



/*

Provides the list of all genres/tags that can be selected from the index.page filter.

*/
var filterGenreList = () => {
    return ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Mystery", "Magic",
            "MagicalSexShift", "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police",
            "PostApocalyptic", "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai",
            "School", "SciFi", "Seinen", "Shoujo", "Shounen", "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame",
            "SuperPower", "Supernatural", "Survival", "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy",
            "Vampire", "VideoGame", "War", "Western", "Workplace", "Yaoi", "Yuri"];
};