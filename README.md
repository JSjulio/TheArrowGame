# Phaser Parcel Template

This is a Phaser 3 project template that uses Parcel for bundling. It supports hot-reloading for quick development workflow and includes scripts to generate production-ready builds.

## If you have DOWNLOADED THIS FILE TO CONTINUE DEV, READ THIS ! 

<!-- 
TODO : ensure you have 'Better Comments' extension when you read this for improved readibilility. 


?PORTS: 

    
    *FRONT-END PORT: 1234:
    The front-end sever runs on PORT 1234 by default. In the case 1234 is not available, Parcel automatically chooses a random port for the server to run on. There is the CORS method of fusing both servers to run on one, but for dev purposeses , we'll the ports on individual ports. 

        *Development / Production Front-end server calls: 
        As shown in the package.json, you can start the frontend with a development call or a production call. This is a safety measure to ensure data will not be erased. 

            *Development:  
            "npm run dev": allows access to seed.js. Seed.js will clear all tables in the db if ran. This is

            *Production: 
            "npm start": allows you run the production server. 
            In the case you happen to break the forbidden rule of not running the seed.js file while in production; the seed file has a fail safe code so nothing from your database will delete. Unless you instruct otherwise in the command line. 

    *BACK-END PORT: 3000: 
        "npm run server": The backend is hard coded to run on port 3000. 
            

    *PORT: 5432: 
    -If you happen to see this port while setting up your prisma.schema (specifically during "DATABASE_URL setup, then ensure to leave it as 5432). 
        *Prisma uses PORT 5432 to communicate with the db and it listens to the Front-end on PORT 3000,  



? Getting Started with this app after cloning a Repo: 


    ? PSQL:

        
TODO   Steps: 

            1.  Create the db as it shows below with the same camel casing
                   *theArrowGame


    ? Prisma: 

        *0 install all required modules
            identify requirede modules in package.json file  


        *1. npm i --save-dev prisma@latest
            install prisma

        *2 npx prisma init
            create prisma files 


        *3. set up DATABASEURL (in /prisma.shema)         &      .env file 
            This enables the prisma.schema file 
        

        *a. 
        generator client {
                provider = "prisma-client-js"
                }

                define the database to connect to
                datasource db {
                provider = "postgresql"
                url      = env("DATABASE_URL")
            }
        

        *3.5 set up .env with the following info: 

        .env: 
                DATABASE_URL="postgresql://<your psql user>:@localhost:5432/theArrowGame"
                JWT="coolPassword"
                NODE_ENV="development"


        * Of note: 
            
            -env file goes within the main directory so backend can access it.

            -the app is set up with "theArrowGame" as the db. When creating your db i urge you to mirrow this nomenclature. It'll make things easier. 

    


    Steps:



        *4 npx prisma migrate dev --name init
            Creates the DB with defined models(Tables) that are in the schema.prisma file
            ?Run this code if you want to restructure the db (Add more rows or columns)
            ?Followed by npx prisma generate 


        *5  npx prisma db pull
            This commmand is dope! It read the Database_URL (located in the .env) and connects to the db following. It then introspects the database & translates the database schema from SQL into a prisma data model within the prisma.schema

                TODO Whenever you clone a project with prisma, you start here. 
                    Which makes sense, you need the env files to operate the project 
                ? If it is your own project copy the env file over, if not, create one. 
                WALLAH! MAGIC!
            
            
            To get the latest prisma run:
        *6 npm i @prisma/client@latest
            this command creates a node module which houses the prisma client. That node module is changed evertime the schema is modified but in order to change it you have to run the following: 

            *7 npx prisma generate
                This reads the prisma schema and generates my prisma client library within the @prisma/client node_modules


        *8 set up the enviornment and do you first prisma quiery

            *a. Import Prisma Client
            const { PrismaClient } = require('@prisma/client)
            const prisma = new PrismaClient()

            *b crud methods can be found here:
            ! https://www.prisma.io/docs/orm/prisma-client/queries/crud






-->

### Versions

This template has been updated for:

- [Phaser 3.80.1](https://github.com/phaserjs/phaser)
- [Parcel 2.11.0](https://github.com/parcel-bundler/parcel)

![screenshot](screenshot.png)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:1234` by default. Please see the Parcel documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Parcel will automatically recompile your code and then reload the browser.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

- `index.html` - A basic HTML page to contain the game.
- `src` - Contains the game source code.
- `src/main.js` - The main entry point. This contains the game configuration and starts the game.
- `src/scenes/` - The Phaser Scenes are in this folder.
- `public/assets` - Contains the static assets used by the game.

## Handling Assets

Parcel supports loading assets via JavaScript module `import` statements, which is the recommended way to do it for Parcel.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder. This is done via the `parcel-reporter-static-files-copy` plugin.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Parcel

If you want to customize your build, such as adding plugins for loading CSS or fonts, modify the `parcel/.parcel.*` file for cross-project changes. Or, you can create new Parcel configuration files and target them from specific npm tasks defined in `package.json`. Please see the [Parcel documentation](https://parceljs.org) for more information.

## Cache Issues

### Problem Description

When a file is manually moved out of the `public` folder and then placed back into it, Parcel fails to properly reload the file due to cache management issues. This can result in recent changes not being immediately reflected in the browser.

### Possible Solution

Try deleting the `.parcel-cache` folder and restarting the browser with the cache cleared.

## Join the Phaser Community!

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show-off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2024 Phaser Studio Inc.

All rights reserved.


### Resources 


**Visit** [Get Started with Phaser 3: Fast and Painless] (https://blog.ourcade.co/posts/2019/get-started-phaser3-fast-painless/)


**Clone** [template-parcel to set up a modern Javascript workspace capable of running npm ruin dev, and npm build seamlessly] (https://github.com/phaserjs/template-parcel)

*Watch* [00 Phaser JS with ParcelJS + Typescript - To get and understanding of parcel] (https://www.youtube.com/watch?v=0FFv6DFPJAo)

**Watch** [Javascript Game Development With Phaser - Tiles Mnaps & Plugins] (https://www.youtube.com/watch?v=MR2CvWxOEsw)



