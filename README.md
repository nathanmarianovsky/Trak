<h1 align="center">Trak</h1>

Trak is the one-stop application designed for cataloging all content read and/or watched. Install for use simply by downloading the package for your operating system in the releases.


## Why?

This application was motivated by the simple thought that there is no such dedicated app out there. A typical user will find themselves creating a sheet in order to keep track of content read and/or watched, but this is not visually appealing and can become cumbersome depending on the size of the library. On the other hand using a website solves this, but depends upon a platform that can be offline all the while pushing advertisements on the user. While there are many features that can be motivated from a website service this application maintains all data locally. 


## Future Features

The following is a list of features that are in the plans for future releases prior to a full release:
* Application Logo.
* Create application splash screen.
* Addition/Removal/Update of Record Associations.
	* A record association is meant to link two or more items across multiple categories. In example, an anime can typically be associated to light novels and manga.


## Application Files

There are eight locations for files created by the use of the application. Depending on the operating system most (by default) will be in one of the following:
```
C:\Users\username\AppData\Roaming\Trak\
/home/username/.local/share/Trak/
```
where 'username' has to be replaced.
* Under the "config" folder there will be three files titled configuration.json, location.json, notifications.json, and tutorial.json. These contain the settings parameters, application installation location, application notifications, and the application tutorial load.
* Under the "data" folder all user records are contained. In the application settings this directory can be changed if the user desires for the data to be saved elsewhere.
* Under the "localPages" folder will be the application html files reproduced by the application on launch. In order to avoid having to ask for administrator privileges the application creates new html files locally after modifying them. The modifications occuring correspond to changing the href values of the css and js files.
* Under the "localStyles" folder will be the application css file reproduced by the application on launch. In order to avoid having to ask for administrator privileges the application creates new css files locally after modifying it. The modifications occuring correspond to changing the primary and secondary color values.
* Under the "exportTemp" folder files are generated and removed during an application library export.
* Under the "importTemp" folder files are generated and removed during an application library import.
* Under the "logs" folder log files are generated to maintain a record of the application's actions.

The last folder will be located at:
```
C:\Users\username\TrakDownloads
/home/username/TrakDownloads
```
corresponding to temporary downloads made by the application. This folder will remain empty for the most part as the application maintains it.