/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - rgba2hex: Convert a RGBA color to hex.
    - clearTooltips: Remove all tooltips on the page.
    - initFAB: Initialize the floating action button on the page.
    - initCollapsible: Initialize the collapsible divs on the page.
    - initTooltips: Initialize all tooltips on the page.
    - initSelect: Initialize all select tags on the page.
    - initModal: Initialize all modals on the page.
    - initSelectObservers: Initialize the observers for style mutations on related content select tags.
    - initReviewObserver: Initialize the observer for style mutations on the appropriate review.
    - initSynopsisObserver: Initialize the observer for style mutations on the appropriate synopsis.
    - toastParse: Handles the parsing of a record folder name to display to the user.
    - arrayMove: Moves an element in an array.
    - shuffle: Perform a Fisher-Yates shuffle on an array of items.
    - formatISBNString: Formats a string into a proper ISBN by adding hyphens.
    - formatISBN: Driver function for formatting an ISBN input.
    - filterGenreList: Provides the list of all genres/tags that can be selected from the index.page filter.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Convert a RGBA color to hex.

   - rgba is a color in RGBA form.

*/
var rgba2hex = rgba => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1)
    .map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, "0").replace("NaN", "")).join("")}`;



/*

Provides a hex representing a color with a certain opacity of the given hex color.

   - color is a hex string.
   - opacity is a value between zero and one representing the opacity desired.

*/
var addAlpha = (color, opacity) => color + Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255).toString(16).toUpperCase();
    // var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    // return color + _opacity.toString(16).toUpperCase();



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

Initialize the floating action button on the page.

*/
var initFAB = () => {
    // Define the instance of the fixed action button on the page.
    const elemsFAB = document.querySelectorAll(".fixed-action-btn"),
        instancesFAB = M.FloatingActionButton.init(elemsFAB, { "hoverEnabled": false, "direction": "left" });
};



/*

Initialize the collapsible divs on the page.

*/
var initCollapsible = () => {
    // Define the current instances of collapsible divs found on the page.
    const elemsCollapsible = document.querySelectorAll(".collapsible"),
        instancesCollapsible = M.Collapsible.init(elemsCollapsible);
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
    // Define the current instances of select tags found on the page.
    let elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
};



/*

Initialize all modals on the page.

*/
var initModal = () => {
    // Define the current instances of modals found on the page.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal, { "onCloseEnd": () => document.body.style.overflowY = "visible" });
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

Initialize the observer for style mutations on the appropriate review.

   - review is the input corresponding to the appropriate review.

*/
var initReviewObserver = review => {
    // Define the select tags observer.
    let observer = new MutationObserver(mutations => {
        // Define the item target on the page.
        let trgt = mutations[0].target;
        // If the height of the textarea is extended then display the vertical scroll bar.
        trgt.style.height == "45px" ? document.body.style.overflowY = "hidden" : document.body.style.overflowY = "visible";
    });
    // Tell the observer to watch for changes.
    observer.observe(review, { "attributes": true, "attributeFilter": ["style"] });
};



/*

Initialize the observer for style mutations on the appropriate synopsis.

   - synopsis is the input corresponding to the appropriate synopsis.

*/
var initSynopsisObserver = synopsis => {
    // Define the select tags observer.
    let observer = new MutationObserver(mutations => {
        // Define the item target on the page.
        let trgt = mutations[0].target;
        // If the height of the textarea is extended then display the vertical scroll bar.
        trgt.style.height == "45px" ? document.body.style.overflowY = "hidden" : document.body.style.overflowY = "visible";
    });
    // Tell the observer to watch for changes.
    observer.observe(synopsis, { "attributes": true, "attributeFilter": ["style"] });
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

Moves an element in an array.

    - arr is the array in which the desired element will be moved.
    - fromIndex is the current position of the element which will be moved.
    - toIndex is the final position to which the element will be moved.

*/
var arrayMove = (arr, fromIndex, toIndex) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
};



/*

Perform a Fisher-Yates shuffle on an array of items.

    - arr is a collection of any items.

*/
var shuffle = arr => {
    // Define the current index as the length of the given array and initialize the random index.
    let currentIndex = arr.length,
        randomIndex = 0;
    // While the current index is non-zero continue the procedure.
    while(currentIndex > 0) {
        // Define the random index on this iteration.
        randomIndex = Math.floor(Math.random() * currentIndex);
        // Decrease the current index by one.
        currentIndex--;
        // Perform the shuffle step.
        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
    // Return the shuffled array.
    return arr;
};



/*

Formats a string into a proper ISBN by adding hyphens.

   - val is the string to be formatted.

*/
var formatISBNString = val => {
    let curVal = "";
    if(val.length < 4) { curVal = val; }
    else if(val.length == 4) { curVal = val.slice(0, 3) + "-" + val.slice(3); }
    else if(val.length < 10) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4); }
    else if(val.length < 13) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9); }
    else { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9, 12) + "-" + val.slice(12, 13); }
    return curVal;
};



/*

Driver function for formatting an ISBN input.

   - inp is the document input corresponding to the book ISBN.

*/
var formatISBN = inp => inp.value = formatISBNString(inp.value.replace(/\D/g,""));



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