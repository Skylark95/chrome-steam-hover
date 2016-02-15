# Steam Hover

**[Add to Chrome](https://chrome.google.com/webstore/detail/jfakmahmklpeigafdahkgkmnlmfjaphd)**

Show Steam app details with mouse hover on a Steam link.

![](https://raw.githubusercontent.com/Skylark95/chrome-steam-hover/master/screenshots/readme.png)

## Features
#### Show Steam app details when hovering over a link
Simply hover your mouse over a link to view the following details:
  * Title
  * Image
  * Price (including discount if applicable)
  * Platforms
  * Genre
  * Release Date
  * Description

#### Open Store Page
Click on the app title to open a new tab to the store page.

#### View Full Description
The full description is displayed in the tooltip.  Scroll your mouse wheel anywhere in the tooltip to view long descriptions that do not fit.

## Options
#### Change Default Currency
The default currency is US Dollar. To change the currency displayed, navigate to the Chrome extensions page (chrome://extensions) and select the options link under Chrome Steam Hover.

![](https://raw.githubusercontent.com/Skylark95/chrome-steam-hover/master/screenshots/options1.png)

![](https://raw.githubusercontent.com/Skylark95/chrome-steam-hover/master/screenshots/options2.png)

## Contributing
Pull requests are welcome.

To build, checkout the repository and run ```npm install```.  Upon completion the extension will output to the ```./dist``` directory.  To run in chrome, follow the instructions on the [Chrome Developer Guide](https://developer.chrome.com/extensions/getstarted#unpacked) to load the extension.

To make changes, modify files in ```src``` and run ```gulp build``` to output the modified files to the ```./dist``` output directory.  Changes may be synced to the output directory in real time by running ```gulp watch```.


## License
```
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
