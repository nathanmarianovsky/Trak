/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - rgba2hex: Convert a RGBA color to hex.
    - addAlpha: Provides a hex representing a color with a certain opacity of the given hex color.
    - clearTooltips: Remove all tooltips on the page.
    - initTabs: Initialize the tabs on the page.
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
    - genreList: Provides the list of all genres/tags that can be selected from depending on the case.
    - genreListLoad: Appends all genre options as checkboxes.
    - fadeOut: Fades out an element on a page.
    - notificationCreation: Creates a notification listing in the notifications modal.
    - notificationsRemovalListeners: Adds the listeners associated to a record notification listing.
    - convertToDays: Converts a length of time in milliseconds to days.

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

Initialize the tabs on the page.

*/
var initTabs = (scenario = 0) => {
    // Define the instances of the tabs on the page.
    if(scenario == 0) {
        let elemsTabs = document.querySelector("#contentSearchDiv .tabs");
        let instanceTabs = M.Tabs.init(elemsTabs, { "onShow": pageTab => {
            let tabTypeStr = pageTab.getAttribute("id").split("Search")[0],
                tabType = tabTypeStr.charAt(0).toUpperCase() + tabTypeStr.slice(1);
            genreListLoad(tabType, 5, true);
            document.querySelector("#contentSearchDiv .indicator").style.display = "list-item";
            clearTooltips();
            initTooltips();
        }});
    }
    else if(scenario == 1) {
        let elemsTabs = document.querySelector("#databaseModal .tabs");
        let instanceTabs = M.Tabs.init(elemsTabs, { "onShow": pageTab => {
            document.querySelector("#databaseModal .indicator").style.display = "list-item";
            document.getElementById("importXLSXContent").style.display = "none";
        }});
    }
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
        // If this select tag is a desired target then hide the body of episodes associated to a season item.
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
    if(/^[0-9]+$/.test(val)) {
        if(val.length < 4) { curVal = val; }
        else if(val.length == 4) { curVal = val.slice(0, 3) + "-" + val.slice(3); }
        else if(val.length < 10) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4); }
        else if(val.length == 10) { curVal = val.slice(0, 1) + "-" + val.slice(1, 6) + "-" + val.slice(6, 9) + "-" + val.slice(9, 10); }
        else if(val.length < 13) { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9); }
        else { curVal = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9, 12) + "-" + val.slice(12, 13); }
    }
    else { curVal = val.slice(0, 10); }
    return curVal;
};



/*

Driver function for formatting an ISBN input.

   - inp is the document input corresponding to the book ISBN.

*/
var formatISBN = inp => inp.value = formatISBNString(inp.value.replace(/\W/g,""));



/*

Provides the list of all genres/tags that can be selected from depending on the case.

   - type is a string that corresponds to the different cases 'All', 'Anime', 'Book', 'Film', 'Manga', and 'Show'.

*/
var genreList = (type = "All") => {
    let genArr = [];
    if(type == "Anime") {
        genArr = ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Mystery", "Magic",
            "MagicalSexShift", "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police",
            "PostApocalyptic", "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai",
            "School", "SciFi", "Seinen", "Shoujo", "Shounen", "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame",
            "SuperPower", "Supernatural", "Survival", "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy",
            "Vampire", "VideoGame", "War", "Western", "Workplace", "Yaoi", "Yuri"];
    }
    else if(type == "Book") {
        genArr = ["Action", "Adventure", "Comedy", "Crime", "Dystopian", "Fantasy", "Fiction", "Historical", "Horror", "Mystery",
            "Mythology", "Nonfiction", "Romance", "Satire", "Sci-Fi", "Thriller", "Tragedy", "Western"];
    }
    else if(type == "Film") {
        genArr = ["Action", "Adventure", "AlternateHistory", "Amateur", "Animation", "Anthology", "Art", "Biopic", "Comedy",
            "Crime", "Cyberpunk", "Detective", "Docudrama", "Documentary", "Drama", "Dystopian", "Fantasy", "Gangster", "Ghost",
            "Gore", "Gothic", "Heist", "Historical", "Holiday", "Horror", "Instructional", "Military", "Monster", "Musical",
            "Mystery", "Nature", "Paranormal", "Parody", "Political", "PostApocalyptic", "Psychological", "Reality", "Religious",
            "Revisionist", "Romance", "Satire", "SciFi", "Space", "SpaceOpera", "Sports", "Spy", "StopMotion", "Superhero",
            "Thriller", "Utopian", "Vampire", "Vigilante", "Western", "Zombie"];
    }
    else if(type == "Manga") {
        genArr = ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Kids", "Medical", "Mystery", "Magic", "MagicalSexShift",
            "MartialArts", "Mecha", "Military", "Music", "OrganizedCrime", "Parody", "Police", "PostApocalyptic",
            "Psychological", "Racing", "Reincarnation", "ReverseHarem", "Romance", "Samurai", "School", "SciFi",
            "SliceOfLife", "Space", "Sports", "Spy", "StrategyGame", "SuperPower", "Supernatural", "Survival",
            "Suspense", "Teaching", "Thriller", "TimeTravel", "Tragedy", "Vampire", "VideoGame", "War", "Western",
            "Workplace", "Yaoi", "Yuri"];
    }
    else if(type == "Show") {
        genArr = ["Action", "Adventure", "AlternateHistory", "Amateur", "Animation", "Anthology", "Art", "Biopic", "Comedy",
            "CookingShow", "Crime", "Cyberpunk", "Detective", "Docudrama", "Documentary", "Drama", "Dystopian", "Fantasy", "GameShow",
            "Gangster", "Ghost", "Gore", "Gothic", "Heist", "Historical", "Holiday", "Horror", "Instructional", "Military", "Monster",
            "Musical", "Mystery", "Nature", "Paranormal", "Parody", "Political", "PostApocalyptic", "Psychological", "Reality",
            "Religious", "Revisionist", "Romance", "Satire", "SciFi", "Space", "SpaceOpera", "Sports", "Spy", "StopMotion",
            "Superhero", "TalkShow", "Thriller", "Utopian", "Vampire", "Vigilante", "Western", "Zombie"];
    }
    else if(type == "All") {
        genArr = [...new Set([].concat.apply([], [genreList("Anime"), genreList("Book"), genreList("Film"), genreList("Manga"), genreList("Show")]))];
        genArr.sort((a, b) => a.localeCompare(b));
    }
    return genArr;
};



/*

Appends all genre options as checkboxes.

   - type is a string that corresponds to the different cases 'All', 'Anime', 'Book', 'Film', 'Manga', and 'Show'.
   - cols is a number representing the number of columns for the genres/tags table.
   - filterLoad is a boolean representing whether the genres/tags are being appended to the index page filter.

*/
var genreListLoad = (type, cols, filterLoad = false) => {
    // Define the genres form, list of genres, and number of columns and rows.
    const genresForm = filterLoad == false ? document.getElementById("category" + type + "Form2") : document.getElementById("filterForm"),
        genresLst = genreList(type),
        rows = Math.ceil(genresLst.length / cols);
    genresForm.innerHTML = "";
    // Iterate through all rows needed.
    for(let r = 0; r < rows; r++) {
        // Construct a div to contain the row.
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("genreRow");
        // Iterate through all columnds needed.
        for(let s = 0; s < cols; s++) {
            // Define the text associated to the genre.
            let filterGenreStr = "";
            if(genresLst[(s * rows) + r] == "CGDCT") {
                filterGenreStr = "CGDCT";
            }
            else if(genresLst[(s * rows) + r] == "ComingOfAge") {
                filterGenreStr = "Coming-of-Age";
            }
            else if(genresLst[(s * rows) + r] == "PostApocalyptic") {
                filterGenreStr = "Post-Apocalyptic";
            }
            else if(genresLst[(s * rows) + r] == "SciFi") {
                filterGenreStr = "Sci-Fi";
            }
            else if(genresLst[(s * rows) + r] == "SliceOfLife") {
                filterGenreStr = "Slice of Life";
            }
            else if(genresLst[(s * rows) + r] != undefined) {
                filterGenreStr = genresLst[(s * rows) + r].split(/(?=[A-Z])/).join(" ");
            }
            else { filterGenreStr = ""; }
            // Define the checkbox, label, and span associated to the genre.
            let genreCheckLabel = document.createElement("label"),
                genereCheckInput = document.createElement("input"),
                genereCheckSpan = document.createElement("span");
            // Modify the page elements.
            genreCheckLabel.classList.add("col", "s2");
            genereCheckInput.setAttribute("type", "checkbox");
            filterGenreStr != ""
                ? (filterLoad == false ? genereCheckInput.setAttribute("id", type.toLowerCase() + "Genre" + genresLst[(s * rows) + r]) : genereCheckInput.setAttribute("id", "filterGenre" + genresLst[(s * rows) + r]))
                : genreCheckLabel.classList.add("invisibleGenreCheck");
            genereCheckInput.classList.add("filled-in");
            if(filterLoad == true) { genereCheckInput.classList.add("filterCheckbox"); }
            genereCheckSpan.textContent = filterGenreStr;
            genereCheckSpan.classList.add("checkboxText");
            // Append the checkbox and text to the row.
            genreCheckLabel.append(genereCheckInput, genereCheckSpan);
            rowDiv.append(genreCheckLabel);
        }
        // Append the row to the filter form.
        genresForm.append(rowDiv);
    }
};



/*

Fades out an element on a page.

   - el is the page element desired to fade out and eventually disappear.
   - diff is the amount subtracted on each iteration of the opacity change.

*/
var fadeOut = (el, diff) => {
    el.style.opacity = 1;
    const fade = () => {
        if((el.style.opacity -= diff) < 0) {
            el.style.display = "none";
        }
        else { requestAnimationFrame(fade); }
    }
    fade();
};



/*

Creates a notification listing in the notifications modal.

   - ipcElec provides the means to operate the Electron app.
   - itemId is a string corresponding to the id of a record.
   - itemCategory is a string corresponding to the category of a record.
   - itemTitle is a string corresponding to the name of a record.
   - itemRelease is a string corresponding to the release date text of a record notification.
   - itemImg is a string corresponding to the notification image of a record.

*/
var notificationCreation = (ipcElec, itemId, itemCategory, itemTitle, itemRelease, itemImg) => {
    // Define the portions of the notification listed item.
    const outerLI = document.createElement("li"),
        img = document.createElement("img"),
        span = document.createElement("span"),
        par = document.createElement("p"),
        link = document.createElement("a"),
        linkIcon = document.createElement("i");
    // Modify the notification components appropriately.
    outerLI.classList.add("collection-item", "avatar");
    img.setAttribute("src", itemImg);
    img.classList.add("circle");
    span.classList.add("title", "recordsNameRowDiv", "notificationsTitle");
    span.textContent = itemTitle + " (" + itemCategory + ")";
    span.setAttribute("id", itemId);
    par.innerHTML = itemRelease;
    link.classList.add("secondary-content");
    linkIcon.classList.add("material-icons", "notificationsRemoval");
    linkIcon.textContent = "close";
    // Attach the notification to the notifications modal.
    link.append(linkIcon);
    outerLI.append(img, span, par, link);
    document.getElementById("notificationsCollection").append(outerLI);
};



/*

Adds the listeners associated to a record notification listing.

   - ipcElec provides the means to operate the Electron app.

*/
var notificationsRemovalListeners = ipcElec => {
    const notificationsArr = document.getElementById("notificationsCollection");
    // Listen for a click on the removal of a notification.
    Array.from(document.getElementsByClassName("notificationsRemoval")).forEach(itemRemoval => {
        itemRemoval.addEventListener("click", e => {
            if(notificationsArr.children.length == 1) {
                document.getElementById("notifications").style.display = "none";
                document.getElementById("notificationsExit").click();
            }
            e.target.parentNode.parentNode.remove();
            ipcElec.send("notificationsSave", {"html": notificationsArr.innerHTML});
        });
    });
    // Listen for a click on the name of a notification in order to open the update page.
    Array.from(document.getElementsByClassName("notificationsTitle")).forEach(itemLink => {
        itemLink.addEventListener("click", e => {
            e.preventDefault();
            ipcElec.send("updateRecord", e.target.id);
        });
    });
};



/*

Converts a length of time in milliseconds to days.

   - milli is an integer representing the amount of milliseconds to be converted into days.

*/
var convertToDays = milli => milli / (1000 * 60 * 60 * 24);