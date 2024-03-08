/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on book records.

    - bookSave: Processes the information required to save a book record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a book record.

*/
var bookSave = () => {
    // Define the page save button.
    const bookSaveBtn = document.getElementById("bookSave");
    // Listen for a click on the save button.
    bookSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const bookTitle = document.getElementById("bookTitle").value,
            bookOriginalTitle = document.getElementById("bookOriginalTitle").value,
            bookISBN = document.getElementById("bookISBN").value.replace(/\W/g,""),
            bookAuthors = document.getElementById("bookAuthor").value,
            bookPublisher = document.getElementById("bookPublisher").value,
            bookPublicationDate = document.getElementById("bookPublicationDate").value,
            bookPages = document.getElementById("bookPages").value,
            bookLastRead = document.getElementById("bookLastRead").value,
            bookMediaType = document.getElementById("bookMediaType").value,
            bookSynopsis = document.getElementById("bookSynopsis").value,
            bookRating = document.getElementById("bookRating").value,
            bookReview = document.getElementById("bookReview").value,
            bookImg = document.getElementById("addRecordBookImg").getAttribute("list").split(","),
            bookFiles = Array.from(document.getElementById("bookAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("bookOtherGenres").value.split(",").map(elem => elem.trim()),
            genresLst = genreList("Book"),
            genres = [];
        // Check to see that a proper ISBN was provided.
        if(bookISBN.length == 13 || bookISBN.length == 10) {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("bookGenre" + genresLst[p]).checked);
            }
            const ogName = document.getElementById("bookTitle").getAttribute("oldName"),
                ogISBN = document.getElementById("bookTitle").getAttribute("oldISBN"),
                oldTitle = ogName !== null ? ogName : bookTitle,
                oldISBN = ogISBN !== null ? ogISBN : bookISBN;
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Book", bookTitle, bookOriginalTitle, bookISBN, bookAuthors, bookPublisher, bookPublicationDate,
                bookPages, bookLastRead, bookMediaType, bookFiles, bookSynopsis, bookRating, bookReview, [genresLst, genres, otherGenres],
                [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), bookImg], [oldISBN, oldTitle]];
            ipcRenderer.send("performSave", submissionMaterial);
            saveAssociations("Book", bookTitle, ipcRenderer);
        }
        // If no ISBN has been provided then notify the user.
        else { M.toast({"html": "A book record requires that an ASIN/ISBN be provided.", "classes": "rounded"}); }
    });
};