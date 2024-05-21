# The Arrow Game
[The Arrow Game!](#https://the-arrow-game-1bbc9552076c.herokuapp.com/) 🎯


## Table of Contents
1. [Introduction](#introduction)
2. [Authentication, Game Room Selection, & Ready Up](#authentication-game-room-selection--ready-up)
3. [Gameplay](#gameplay)
4. [Game Over](#game-over)
5. [Project Structure](#project-structure)
6.  [Phaser Parcel Template](#phaser-parcel-template)
7.  [Development](#development)
8.  [Additional Instructions](#additional-instructions)
9.  [Writing Code](#writing-code)
10. [Template Project Structure](#template-project-structure)
11. [Handling Assets](#handling-assets)
12. [Deploying to Production](#deploying-to-production)
13. [Customizing the Template](#customizing-the-template)
14. [Cache Issues](#cache-issues)
15. [Join the Phaser Community](#join-the-phaser-community)
16. [Resources](#resources)


# Introduction 
The Arrow Game is an exciting 2D multiplayer web game where players compete in fast-paced arrow-shooting action. Built with JavaScript, Phaser 3, and Parcel 2, the game features dynamic maps created with Tiled and a robust backend using Socket.io, Node.js, and Express. The scalable server architecture allows for unlimited game room instances, offering a seamless multiplayer experience.


## Authentication, Game Room Selection, & Ready Up

1. **Authentication:**
   - New players create an account.
   - Returning players log in to access the web app.

2. **Selecting a Game Room:**
   - Enter the lobby and input a game room character to create or join a specific game instance.
   - Players are then forwarded to the Ready scene.

3. **Ready Up:**
   - Once ready, one player within the Ready scene must select the 'Ready!' button to start the countdown.
   - Players are unable to join a game room once the countdown 4 seconds or less or the game has started.
   - After the countdown, players enter the game.

## Gameplay 

- **Starting Conditions:**
  - All players spawn with 10 lives and a 100-second game timer.
  
- **Controls:**
  - **Move:** Arrow keys
  - **Shoot Arrows:** Space key
  
- **Objective:**
  - Be the last player standing or have the most lives when the timer runs out.
  
- **Player Options Upon Death:**
  - If two or more players remain, the player can choose to spectate or quit the application.


## Game Over

When the game over criteria are met, players are taken to the Game Over scene where the winner(s) are displayed. Players can then choose to:
- Play again and return to the lobby scene.
- Exit the app.


# Project Structure

## Phaser Parcel Template

The Arrow Game uses a Phaser 3 project template with Parcel for bundling the frontend. Parcel supports hot-reloading for a quick development workflow and includes scripts for generating production-ready builds.

### Ports in Development
- **Front-end Port (1234):** Runs on PORT 1234 by default. If unavailable, Parcel chooses a random port.
- **Back-end Port (3000):** Configured to run on Heroku's given port.
- **Database Port (5432):** Prisma uses PORT 5432 to communicate with the database and listens to the front end on PORT 3000.


## Development

To develop from this repository, follow the following steps:

1. Clone the repository.
2. Install all required modules: npm install.
3. Install Prisma: npm i --save-dev prisma@latest.
4. Initialize Prisma: npx prisma init.
5. Set up `.env` file: 
    ```
    DATABASE_URL="postgresql://psqluser:@localhost:5432/theArrowGame"
    JWT_SECRET="----"
    NODE_ENV="development"
    ```

6. Update the schema.prisma file to reflect your database schema.
7. Run Prisma Migrate: `npx prisma migrate dev --name init`
8. Generate Prisma Client: `npx prisma generate`
9. Seed the database: `npm run seed`
10. Install the latest Prisma Client: `npm i @prisma/client@latest`
11. Generate Prisma Client again: `npx prisma generate`
12. Start the application:
 - Front end: `npm run dev`
 - Back end: `npm run server`


## Additional Instructions: 

### Versions

This template has been updated for:

- [Phaser 3.80.1](https://github.com/phaserjs/phaser)
- [Parcel 2.11.0](https://github.com/parcel-bundler/parcel)

![screenshot](screenshot.png)

### Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

### Available Commands

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

**Visit:** [Get Started with Phaser 3: Fast and Painless](https://blog.ourcade.co/posts/2019/get-started-phaser3-fast-painless/)
**Clone:** [template-parcel to set up a modern JavaScript workspace](https://github.com/phaserjs/template-parcel)
**Watch:** [Phaser JS with ParcelJS + TypeScript](https://www.youtube.com/watch?v=0FFv6DFPJAo)
**Watch:** [JavaScript Game Development With Phaser - Tiles Maps & Plugins](https://www.youtube.com/watch?v=MR2CvWxOEsw)




