# Alvo 🦕

A block based programming language for the UR5/MiR mobile manipulator.

## :card_index_dividers:	Files
- index.html: The HTML file where the programming language is loaded. Can navigate to two or one canvas applications from here.
- onecanvas.html: Single canvas (non-function based) programming page.
- twocanvas.html: Two canvas (function based) programming page.
- css: Folder containing the stylesheets of index.html, onecanvas.html, twocanvas.html
- js: Folder containing the javascript code of index.html, onecanvas.html, twocanvas.html
- bootstrap: Folder containing files from the bootstrap front-end framework.
- mobile-app: The source code for the WPF application.
- blockly: A fork of the blockly programming editor.

## :nut_and_bolt: Dealing with the code

### Structure

The project is divided into two parts: 

The first part is the block based front-end, written in Javascript and using the Blockly client-side library, it provides all the necessary functionalities of the programming language, including the programming workspace, components and compiler.

The second part of the project is the desktop application, written in Windows Presentation Foundation (WPF) format and C#, it uses a Chromium webview to render the frontend, html files and js folder (i.e. the programming language), and the URScript (https://s3-eu-west-1.amazonaws.com/ur-support-site/124999/scriptManual_3.15.4.pdf) language to communicate with the UR5 controller. The WPF is responsible for connecting the user to the UR5 controller, uploading code to the UR5, signaling the MiR api, monitoring and handshaking both robots, etc.

**Summary:** If you are interested only in the programming language, take a look at the files related to the frontend, such as index.html and the js/ folder. If you are interested in the application, start by taking a look at the app/ folder.

### Technologies

For the website, make sure you are familiar with [Javascript](https://www.javascript.com/) and [Blockly](https://developers.google.com/blockly). We use Blockly not only to create the programming environment but also to translate the Blockly components to URScript code (i.e. the UR5's programming language). If you are not familiar with URScript code, start by taking a look at its [manual](https://s3-eu-west-1.amazonaws.com/ur-support-site/124999/scriptManual_3.15.4.pdf).

For the desktop application, you will need to know C#, REST api protocols and Windows Presentation Foundation (WPF). The [tutorials](https://docs.microsoft.com/en-us/visualstudio/designers/getting-started-with-wpf) provided by Microsoft for WPF development are great, and may be useful for you if you don't know how it works.

## :computer: Building your local workspace
First, download the repository. The index.html file is referenced relative to the folder the repo is contained in so the WPF should always be able to find it once connected to the controller. To execute the code of the desktop application, open the MobileRobotProject.sln that is inside the mobile-app/ folder using Visual Studio (not Visual Studio Code!), and let Visual Studio build your local workspace.

## :speech_balloon:	For help

If you need help do not hesitate to send a message to:
- Ethan Hollingsworth: Ethan.Hollingsworth@ccam-va.com  or  hollingsworre@vcu.edu
