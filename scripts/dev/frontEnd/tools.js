/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - clearTooltips: Remove all tooltips on the page.
    - initTooltips: Initialize all tooltips on the page.
    - initSelect: Initialize all select tags on the page.
    - initSelectObservers: Initialize the observers for style mutations on related content select tags.
    - initContentDrag: Initialize the listeners associated to related content dragging.

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
    // For each relevant select tag tell the observe to watch for changes.
    for(let i = 0; i < lst.length; i++) {
        observer.observe(lst[i], { "attributes": true, "attributeFilter": ["style"] });
    }
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