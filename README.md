# AI DeepFake check
![DeepFake Logo](src/images/logo128.png)  
This is a browser extension to detect deep fakes.  
A new button is integrated in the YouTube player for this purpose.  



## Table of contents
- [Use](#use)
- [Development](#development)


## Use
After installation, the options page will open automatically.  
A [Modzy](https://www.modzy.com/) ApiKey must be entered.  
The page contains instructions for this.  

With this new button in the player you can start the video recording.  
![new icon](src/images/newIcon.png)  
Default recording is 5 seconds.  
After recording, the video is automatically sent to the AI for analysis.  
You can watch the recorded video in an extra player or download it.  
The result of the AI analysis is displayed in this player.  
Example:  
![Obama](assets/Obama.png)  

## Development
I use [PARCEL](https://parceljs.org/) as build tool and install it globally with
```shell
# install PARCEL
npm install -g parcel
```

Build local
```shell
# install dependencies
npm install

# build dist folder
npm run build:parcel
```
Then load the dist directory as an Chrome extension.

