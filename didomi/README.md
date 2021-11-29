# Consent Management Node JS Project

&nbsp;

## 📁 Table of Contents

-   [🧠 Purpose](#-purpose)
-   [👟 Running the Project](#-running-the-project)
-   [💬 Server](#-server)
-   [🔐 Closing Remarks](#-closing-remarks)

&nbsp;

## 🧠 Purpose

This project meets the requirements of a Consent Management API as described in the requirements of Didomi.
The Project was implemented using Node JS, Typescript and Node js Express 
The Application runs on mysql server and requires a database to be created before use

To Create a database from the mysql terminal

`create database didomi charset utf8mb4 ;`


&nbsp;

## 🧠 APIs

The Application provides the following Apis for the following functionalities

Path = /users   
Request Method = GET  
Query Parameters : id - The Id of the User to be Fetched  
Description = This returns the User and Consents attached to the specified Query Parameter "id"  
Returns - It returns the details of the Querried User  


Path = /users  
Request Method = POST  
JSON BODY :   
Description = This is used to Create the User.  
				Atleast an Email address must be passed   
				Additionally, if a consent array is passed, it would be updated as well on the newly created user  
Returns - It returns the Id as well as the details of the Newly Created User  


Path = /users  
Request Method = DELETE  
Query Parameters : id - The Id of the User to be Removed  
Description = This is used to Delete a User as well as all the associated Consents and Histories  


Path = /events  
Request Method = POST  
JSON BODY :   
Description = This is used to specify the consents for a Given User the Consent is passed along with the User Data as follows  

```json
{
  "user": {
    "id": "00000000-0000-0000-0000-000000000000"
  },
  "consents": [
    {
      "id": "email_notifications",
      "enabled": false
    },
    {
      "id": "sms_notifications",
      "enabled": true
    }
  ]
}
```

Returns - It returns the the details of the User as well as current consents



Path = /install  
Request Method = POST  
Description = This api can be used to Install the Database.  
				It invokes the migration layer that performs all the necessary database initializations  
				You would need to create the database first  


Path = /eventhistories  
Request Method = GET  
Query Parameters : id - The Id of the User whose Consents Histories to be Fetched  
Description = This api is used to retrieve the consent histories of a Given User, It allows us keep track  
			of the request flow that led up to the current Consent.  
Returns - It returns the Event Histories of the given User  





## 🧠 Edge Case

When it comes to consent events being submitted, there is the possible scenario of an empty list of consents being submitted
to represent no consent selection. 
Since this would inadvertently disrupt the history management process as there is no record to be captured.
I filled in both consents with false values indicating that they were turned off.
This implies that a subsequent get request would return all the consents turned off as against an empty list of consents
but this helps the history process keep track of the fact that all consents where turned off in that particular scenario.

&nbsp;

## 👟 Running the Project

The Project can be Run in development mode by using the script  `npm run dev` to get up and going!
For First time Use, You would need to run `npm install` to initialize the dependent node modules

&nbsp;

First:

```bash
git clone https://github.com/ibemedominic/consentmanagement.git YOUR_PROJECT_NAME
```

This command will "clone" this project's code to the local machine! It will default to the name of the GitHub repository, but you can rename it by providing an additional argument, like `YOUR_PROJECT_NAME` in the above example. It will create a folder by that name, and copy all the code into it for you!

&nbsp;

Second:

```bash
cd YOUR_PROJECT_NAME
```

Hopefully this is fairly straightforward by this point. It will change directories into the folder we just cloned the code into. 

&nbsp;

Third:

```bash
npm install
```

This is also hopefully straightforward by now it will look into the `package.json` and `package-lock.json` to install the needed dependencies for this project to do its job.
It will create your `node_modules` folder for you which is what makes time travel possible lets the project run.
if you have any errors, perhaps cos you have a newer version of node, you can use 

```bash
npm install --force
```

To force the installation


&nbsp;


Fourth:  

In development mode, you would need to create a file called `.env` in the root folder and place all the environment variables there

DB_PORT=3306  
DB_HOST=localhost  
DB_USER=<username>  
DB_PASSWORD=<password>  
DB_NAME=didomi  
PORT=3000  

In Production mode you do not need to specify a .env file,  
please note that the Production environment expects an environment variable defined as follows  

NODE_ENV = production  

You would need to setup the environment variables specified in the .env file in your environment first before running in production mode.  
The Environment variables are required to connect to the Database as well as configure the server in production

Fifth:

```bash
npm run dev
```

This command will start the project for us! 

&nbsp;

**The server will start on port 3000 (http://localhost:3000) and should be ready to recieve api requests**

&nbsp;

Optionally: for production

```bash
npm run start
```

-   This assumes you have a `dist/server.js` and `public/js/app.js` already built.

We will use this script in production. We don't need all the auto-restart stuff from the `watch:*` scripts.  
Just start the server and be done with it.  

if deploying in a container like docker, kindly ensure that the right CMD commands are provided in your Dockerfile to execute






&nbsp;

## 💬 Server

The server build process compiles the TypeScript files found in `src/server` into a single bundled JavaScript file (`server.js`) located in the `dist` directory, which is created for us during the process.

This is where i added all the codes relating to the database. It's also where all of the REST API routes reside as well as the backend utilities.

The Application was designed to be as modular as possible...  
I provided multiple abstraction layers to decouple as much functionality as necessary as follows according to folder structure

- src/server/config  
	This provides system wide configuration settings by reading key parameters from the environment variables or the .env file (development mode)

- src/server/model  
	This keeps track of all our Database Model Objects and entities for transporting data across the application as well 

- src/server/migrations  
	This can be used to keep track of schema changes within the application.   
	Every new set of Schema changes can be grouped into a new update file that can then be executed on the server

- src/server/repository  
	This represents all the querries and Data Access Objects that are used accross the application  
	It also holds the Connection settings

- src/server/service  
	This represents the Service layer of the application that manages all the business logic and data interactions within the application

- src/server/validations  
	This handles all the validations in the application framework

- tests  
	This contains the Test Cases for the Application


&nbsp;

## 🗄️ Configuration Files

-   `.gitignore` - This is used to **not** push certain files or folders to GitHub. This starts with the dependencies and production bundles being ignored.  

-   `package-lock.json` - This is automatically generated whenever you run a command that modifies `node_modules` or `package.json`.   
	It describes the exact modification that was made, such that subsequent installs are able to generate identical modifications, regardless of intermediate dependency updates.

-   `package.json`- The basic "metadata" relevant to the project and is used for managing the project's dependencies, scripts, version and a whole lot more.

-   `README.md` -The markdown file that displays here in GitHub that you're reading right now.

-   `tsconfig.client.json` the TypeScript rules our TSC compiler will follow and allow when building the React app.  
	This was not completed as it wasnt necessary as earlier thought.

-   `tsconfig.server.json` the same as above, basically, except for our server code.  

-   `webpack.config.js` the rules, loaders, and plugins our entire build process follows. 
	
&nbsp;

&nbsp;

## 🔐 Closing Remarks

The project was written to be as consise and easy to understand as possible.
I adopted methodologies from the 12 factor app process to streamline the application for easy of deployment to a microservice based environment like docker.
