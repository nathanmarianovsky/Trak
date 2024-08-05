/*

BASIC DETAILS: This file provides front-end functions designed to be used by multiple aspects of the app.

    - checkAllFunc: Handler associated to the click event listener on the index page checkAll checkbox.
    - recordCheckFunc: Handler associated to the change event listener on the index page record checkboxes.
    - rgba2hex: Convert a RGBA color to hex.
    - addAlpha: Provides a hex representing a color with a certain opacity of the given hex color.
    - clearTooltips: Remove all tooltips on the page.
    - initDropdown: Initialize the dropdowns on the page.
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
    - notificationsListeners: Adds the listeners associated to a record notification listing.
    - convertToDays: Converts a length of time in milliseconds to days.
    - settingsBtnsInit: Initializes the behavior for the top nav buttons on the settings modal.
    - updateCountString: Attach the bottom text on the index page corresponding to the filtered library records.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Handler associated to the click event listener on the index page checkAll checkbox.

   - e is the event object associated to a click event.

*/
const checkAllFunc = e => {
    // Define the collection of all record rows, the remove button, and checkAll button.
    const bodyList = Array.from(document.getElementById("tableBody").children).filter(item => item.style.display != "none"),
        homeSelected = document.getElementById("homeSelected"),
        btn = document.getElementById("remove"),
        checkAll = document.getElementById("checkAll");
    // If the checkAll is checked then check all records.
    if(checkAll.checked) {
        for(let i = 0; i < bodyList.length; i++) {
            bodyList[i].children[0].children[0].children[0].checked = true;
        }
        if(bodyList.length > 0) {
            btn.style.display = "inherit";
        }
        homeSelected.textContent = bodyList.length + " Selected";
    }
    // Otherwise, if the checkAll is unchecked then uncheck all records.
    else {
        for(let i = 0; i < bodyList.length; i++) {
            bodyList[i].children[0].children[0].children[0].checked = false;
        }
        btn.style.display = "none";
        homeSelected.textContent = "";
    }
};



/*

Handler associated to the change event listener on the index page record checkboxes.

*/
const recordCheckFunc = () => {
    // Define the collection of all record rows, the remove button, checkAll button, and the associated lengths.
    let btn = document.getElementById("remove"),
        checkAllBtn = document.getElementById("checkAll"),
        homeSelected = document.getElementById("homeSelected"),
        checkArr = Array.from(document.querySelectorAll(".recordsChecks")).filter(item => item.parentNode.parentNode.parentNode.style.display != "none"),
        checkTotal = checkArr.length,
        checkedNum = checkArr.filter(elem => elem.checked).length;
    // Check if the checkAll checkbox should be checked.
    checkTotal - 1 == checkedNum && !checkAllBtn.checked ? checkAllBtn.checked = true : checkAllBtn.checked = false;
    // Proceed only if at least one record is checked.
    if(checkedNum > 0) {
        btn.style.display = "inherit";
        if(checkTotal - 1 == checkedNum && !checkAllBtn.checked) { checkedNum--; }
        homeSelected.textContent = checkedNum + " Selected";
    }
    // Otherwise proceed for the case where no records are checked.
    else {
        btn.style.display = "none";
        homeSelected.textContent = "";
    }
};



/*

Convert a RGBA color to hex.

   - rgba is a color in RGBA form.

*/
const rgba2hex = rgba => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1)
    .map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, "0").replace("NaN", "")).join("")}`;



/*

Provides a hex representing a color with a certain opacity of the given hex color.

   - color is a hex string.
   - opacity is a value between zero and one representing the opacity desired.

*/
const addAlpha = (color, opacity) => color + Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255).toString(16).toUpperCase();



/*

Remove all tooltips on the page.

*/
const clearTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Destroy each tooltip.
    for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }
};



/*

Initialize the dropdowns on the page.

*/
const initDropdown = () => {
    // Define the current instances of dropdowns found on the page.
    let elems = document.querySelectorAll('.dropdown-trigger'),
        instances = M.Dropdown.init(elems);
};



/*

Initialize the tabs on the page.

*/
const initTabs = (scenario = 0) => {
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
const initFAB = () => {
    // Define the instance of the fixed action button on the page.
    const elemsFAB = document.querySelectorAll(".fixed-action-btn"),
        instancesFAB = M.FloatingActionButton.init(elemsFAB, { "hoverEnabled": false, "direction": "left" });
};



/*

Initialize the collapsible divs on the page.

*/
const initCollapsible = () => {
    // Define the current instances of collapsible divs found on the page.
    const elemsCollapsible = document.querySelectorAll(".collapsible"),
        instancesCollapsible = M.Collapsible.init(elemsCollapsible);
};



/*

Initialize all tooltips on the page.

*/
const initTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
};



/*

Initialize all select tags on the page.

*/
const initSelect = () => {
    // Define the current instances of select tags found on the page.
    let elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
};



/*

Initialize all modals on the page.

*/
const initModal = () => {
    // Define the current instances of modals found on the page.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal, { "onCloseEnd": () => document.body.style.overflowY = "visible" });
};



/*

Initialize the observers for style mutations on related content select tags.

*/
const initSelectObservers = () => {
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
const initReviewObserver = review => {
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
const initSynopsisObserver = synopsis => {
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
const toastParse = folder => {
    let hldr = folder.split("-")[0];
    return nameStr = hldr.toLowerCase() + " " + folder.substring(hldr.length + 1);
};



/*

Moves an element in an array.

    - arr is the array in which the desired element will be moved.
    - fromIndex is the current position of the element which will be moved.
    - toIndex is the final position to which the element will be moved.

*/
const arrayMove = (arr, fromIndex, toIndex) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
};



/*

Perform a Fisher-Yates shuffle on an array of items.

    - arr is a collection of any items.

*/
const shuffle = arr => {
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
const formatISBNString = val => {
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
const formatISBN = inp => inp.value = formatISBNString(inp.value.replace(/\W/g,""));



/*

Provides the list of all genres/tags that can be selected from depending on the case.

   - type is a string that corresponds to the different cases 'All', 'Anime', 'Book', 'Film', 'Manga', and 'Show'.

*/
const genreList = (type = "All") => {
    let genArr = [];
    if(type == "Anime") {
        genArr = ["Action", "Adventure", "Anthropomorphic", "AvantGarde", "Comedy", "ComingOfAge", "CGDCT",
            "Cyberpunk", "Demon", "Drama", "Ecchi", "Erotica", "Fantasy", "Game", "Gore", "Gourmet", "Harem",
            "Hentai", "Historical", "Horror", "Isekai", "Josei", "Kids", "Medical", "Magic", "MagicalSexShift",
            "MartialArts", "Mecha", "Military", "Music", "Mystery", "OrganizedCrime", "Parody", "Police",
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
            "Hentai", "Historical", "Horror", "Isekai", "Kids", "Medical", "Magic", "MagicalSexShift", "MartialArts",
            "Mecha", "Military", "Music", "Mystery", "OrganizedCrime", "Parody", "Police", "PostApocalyptic",
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
        genArr = [...new Set([].concat(genreList("Anime"), genreList("Book"), genreList("Film"), genreList("Manga"), genreList("Show")))];
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
const genreListLoad = (type, cols, filterLoad = false) => {
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
const fadeOut = (el, diff) => {
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

   - curPath is a string corresponding to the current user data path.
   - itemId is a string corresponding to the id of a record.
   - itemCategory is a string corresponding to the category of a record.
   - itemTitle is a string corresponding to the name of a record.
   - itemScenario is a string corresponding to the release type text of a record notification.
   - itemRelease is a string corresponding to the release date text of a record notification.
   - itemImg is a string corresponding to the notification image of a record.
   - itemSnooze is a string corresponding to the snooze date of a record notification.

*/
const notificationCreation = (curPath, itemId, itemCategory, itemTitle, itemScenario, itemRelease, itemImg, itemSnooze) => {
    // Define the portions of the notification listed item.
    const outerLI = document.createElement("li"),
        img = document.createElement("img"),
        imgIcon = document.createElement("i"),
        span = document.createElement("span"),
        par = document.createElement("p"),
        link = document.createElement("div"),
        linkLabel = document.createElement("label"),
        linkInput = document.createElement("input");
    // Modify the notification components appropriately.
    outerLI.classList.add("collection-item", "avatar");
    outerLI.setAttribute("notificationId", itemId);
    outerLI.setAttribute("notificationCategory", itemCategory);
    outerLI.setAttribute("notificationTitle", itemTitle);
    outerLI.setAttribute("notificationScenario", itemScenario);
    outerLI.setAttribute("notificationRelease", itemRelease);
    outerLI.setAttribute("notificationSnooze", itemSnooze);
    // Modify the saved absolute path of an association image to a relative one.
    let splitter1 = itemImg.split("Trak/data"),
        splitter2 = itemImg.split("Trak\\data"),
        split = curPath + (splitter1.length > 1 ? "/Trak/data" + splitter1[1] : "\\Trak\\data" + splitter2[1]);
    img.setAttribute("src", split);
    img.classList.add("circle");
    imgIcon.classList.add("material-icons", "circle");
    imgIcon.textContent = "notifications_active";
    span.classList.add("title", "recordsNameRowDiv", "notificationsTitle");
    span.textContent = itemTitle + " (" + itemCategory + ")";
    span.setAttribute("id", itemId);
    // Process the corresponding notification date to be displayed.
    if(itemRelease != "") {
        let dateArr = itemRelease.split("-");
        dateStr = dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
    }
    par.innerHTML = itemScenario + "<br>To Be Released: " + dateStr;
    link.classList.add("secondary-content", "notificationsCheckDiv");
    linkInput.setAttribute("type", "checkbox");
    linkInput.classList.add("filled-in", "notificationCheck");
    linkLabel.append(linkInput);
    // Attach the notification to the notifications modal.
    link.append(linkLabel);
    outerLI.append(itemImg != "" ? img : imgIcon, span, par, link);
    document.getElementById("notificationsCollection").append(outerLI);
};



/*

Adds the listeners associated to a record notification listing.

   - ipcElec provides the means to operate the Electron app.

*/
const notificationsListeners = ipcElec => {
    // Define the list of checkboxes for notifications.
    const checkArr = Array.from(document.getElementsByClassName("notificationCheck")),
        globalCheck = document.getElementById("notificationsCheckAll");
    // For each notification checkbox listen for a click in order to check or uncheck the global notifications checkbox.
    checkArr.forEach(itemCheck => {
        itemCheck.addEventListener("click", e => {
            checkArr.every(elem => elem.checked) ? globalCheck.checked = true : globalCheck.checked = false;
        });
    });
    // Listen for a click on the name of a notification in order to open the update page.
    Array.from(document.getElementsByClassName("notificationsTitle")).forEach(itemLink => {
        itemLink.addEventListener("click", e => {
            e.preventDefault();
            ipcElec.send("updateRecord", [false, e.target.id]);
        });
    });
};



/*

Converts a length of time in milliseconds to days.

   - milli is an integer representing the amount of milliseconds to be converted into days.

*/
const convertToDays = milli => milli / (1000 * 60 * 60 * 24);



/*

Initializes the behavior for the top nav buttons on the settings modal.

   - ipcElec provides the means to operate the Electron app.
   - btn is a page element corresponding to a button on the settings modal top nav.
   - containers is a list of page elements corresponding to the containers of top nav buttons on the settings modal.
   - selections is a list of page elements corresponding to the links of top nav buttons on the settings modal.
   - btnContainer is a page element corresponding to the container of btn on the settings modal.
   - showList is an array of class names corresponding to the buttons which are to be shown on the settings modal footer.
   - hideList is an array of class names corresponding to the buttons which are to be hidden on the settings modal footer.

*/
const settingsBtnsInit = (ipcElec, btn, containers, selections, btnContainer, showList, hideList) => {
    // Listen for a click event on the settingsDisplay button on the top bar to display the display settings.
    btn.addEventListener("click", e => {
        e.preventDefault();
        containers.forEach(cont => cont.style.display = "none");
        selections.forEach(item => item.parentNode.classList.remove("active"));
        btnContainer.style.display = "initial";
        btn.parentNode.classList.add("active");
        showList.forEach(className => {
            Array.from(document.getElementsByClassName(className)).forEach(otherBtn => otherBtn.style.display = "inline-block");
            if(className == "settingsLogsButtons") {
                ipcElec.send("logsRequest");
                ipcRenderer.on("logsRequestResult", (event, logsArr) => {
                    const logsTerminal = document.getElementById("logsTerminal");
                    logsTerminal.innerHTML = "";
                    for(let c = 0; c < logsArr.length; c++) {
                        let logSpan = document.createElement("span");
                        if(logsArr[c].includes("[info]")) {
                            logSpan.textContent = logsArr[c].replace(" [info]", "");
                        }
                        else if(logsArr[c].includes("[error]")) {
                            logSpan.textContent = logsArr[c].replace(" [error]", "");
                            logSpan.style.color = "red";
                        }
                        else if(logsArr[c].includes("[warn]")) {
                            logSpan.textContent = logsArr[c].replace(" [warn]", "");
                            logSpan.style.color = "blue";
                        }
                        logsTerminal.append(logSpan, document.createElement("br"));
                    }
                });
            }
        });
        hideList.forEach(className => {
            Array.from(document.getElementsByClassName(className)).forEach(otherBtn => otherBtn.style.display = "none");
        });
    });
};



/*

Attach the bottom text on the index page corresponding to the filtered library records.

   - tbleTotal is an integer corresponding to the total number of library records.
   - countersArr is an array of integers corresponding to the number of library records that have been filtered, with a count denoted for each category.

*/
const updateCountString = (tbleTotal, countersArr) => {
    // Define the standard reduction function to get the sum of an array.
    const arrSum = (accum, cur) => accum + cur;
    // Define the total number of filtered records and the initial component of the filtered bottom message.
    let filterCount = countersArr.reduce(arrSum),
        bottomStrModified = "Filtered Records: " + filterCount + " [" + ((countersArr.reduce(arrSum, 0) / parseInt(homeCounter.getAttribute("totalCounter"))) * 100).toFixed(0) + "%]";
    // If there are filtered records then modify the bottom message accordingly depending on the categories present.
    if(countersArr.reduce(arrSum, 0) > 0) {
        bottomStrModified += " (";
        for(let catIter = 0; catIter < countersArr.length; catIter++) {
            let recType = "";
            if(countersArr[catIter] > 0) {
                if(catIter == 0) {
                    bottomStrModified += countersArr[0] + " Anime";
                    recType = "anime";
                }
                else {
                    let prevSum = countersArr.slice(0, catIter).reduce(arrSum, 0);
                    if(prevSum != 0) {
                        bottomStrModified += ", ";
                    }
                    bottomStrModified += countersArr[catIter];
                    if(catIter == 1) {
                        bottomStrModified += " Book";
                        if(countersArr[catIter] > 1) { bottomStrModified += "s"; }
                        recType = "book";
                    }
                    else if(catIter == 2) {
                        bottomStrModified += " Film";
                        if(countersArr[catIter] > 1) { bottomStrModified += "s"; }
                        recType = "film";
                    }
                    else if(catIter == 3) {
                        bottomStrModified += " Manga";
                        recType = "manga";
                    }
                    else if(catIter == 4) {
                        bottomStrModified += " Show";
                        if(countersArr[catIter] > 1) { bottomStrModified += "s"; }
                        recType = "show";
                    }
                }
                bottomStrModified += " [" + ((countersArr[catIter] / parseInt(homeCounter.getAttribute(recType + "Counter"))) * 100).toFixed(0) + "%]"
            }
        }
        bottomStrModified += ")";
    }
    // Define the original and filtered bottom messages.
    const ogCounter = document.getElementById("homeCounter"),
        filterCounter = document.getElementById("homeCounterModified");
    // If the number of filtered records is less than the total available then hide the original message and display the filtered one.
    if(filterCount != tbleTotal) {
        ogCounter.style.display = "none";
        filterCounter.textContent = bottomStrModified;
        filterCounter.style.display = "block";
    }
    // Otherwise, hide the filtered message and display the original one.
    else {
        filterCounter.style.display = "none";
        filterCounter.textContent = "";
        ogCounter.style.display = "block";
    }
};