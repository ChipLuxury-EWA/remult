# Build a Full-Stack React Application

### Create a simple todo app with Remult using a React frontend

In this tutorial, we are going to create a simple app to manage a task list. We'll use `React` for the UI, `Node.js` + `Express.js` for the API server, and Remult as our full-stack CRUD framework. For deployment to production, we'll use [railway.app](https://railway.app/) and a `PostgreSQL` database.

By the end of the tutorial, you should have a basic understanding of Remult and how to use it to accelerate and simplify full stack app development.

::: tip Prefer Angular?
Check out the [Angular tutorial](../angular/).
:::

### Prerequisites

This tutorial assumes you are familiar with `TypeScript` and `React`.

Before you begin, make sure you have [Node.js](https://nodejs.org) and [git](https://git-scm.com/) installed. <!-- consider specifying Node minimum version with npm -->

# Setup for the Tutorial

This tutorial requires setting up a React project, an API server project, and a few lines of code to add Remult.

You can either **use a starter project** to speed things up, or go through the **step-by-step setup**.

## Option 1: Clone the Starter Project

1. Clone the _react-vite-express-starter_ repository from GitHub and install its dependencies.

```sh
git clone https://github.com/remult/react-vite-express-starter.git remult-react-todo
cd remult-react-todo
npm install
```

2. Open your IDE.
3. Open a terminal and run the `dev` npm script.

```sh
npm run dev
```

4. Open another terminal and run the `dev-node` npm script

```sh
npm run dev-node
```

The default "Vite + React" app main screen should be available at the default Vite dev server address [http://127.0.0.1:5173](http://127.0.0.1:5173).

At this point, our starter project is up and running. We are now ready to move to the [next step of the tutorial](./entities.md) and start creating the task list app.

## Option 2: Step-by-step Setup

### Create a React project using Vite

Create the new React project.

```sh
npm create -y vite@latest remult-react-todo -- --template react-ts
cd remult-react-todo
```

::: warning Run into issues scaffolding the Vite project?
See [Vite documentation](https://vitejs.dev/guide/#scaffolding-your-first-vite-project) for help.
:::

In this tutorial, we'll be using the root folder created by `Vite` as the root folder for our server project as well.

### Install required packages

We need `Express` to serve our app's API, and, of course, `Remult`. For development, we'll use [tsx](https://www.npmjs.com/package/tsx) to run the API server.

```sh
npm i express remult
npm i --save-dev @types/express tsx
```

### Create the API server project

The starter API server TypeScript project contains a single module that initializes `Express`, and begins listening for API requests.

1. Open your IDE.

2. Create a `server` folder under the `src/` folder created by Vite.

3. Create an `index.ts` file in the `src/server/` folder with the following code:

```ts [index.ts]
// src/server/index.ts

import express from 'express'

const app = express()

app.listen(3002, () => console.log('Server started'))
```

::: warning Important
In this tutorial we'll use Node.js, CommonJS module system.

Therefore, it is important to **remove the `"type": "module"` entry from the `package.json` file** created by Vite.

```json
// package.json

"type": "module", // <- remove this
```

Don't worry, this does not cause any side-effects.
:::

### Bootstrap Remult in the back-end

Remult is loaded in the back-end as an `Express middleware`.

1. Create an `api.ts` file in the `src/server/` folder with the following code:

```ts
// src/server/api.ts

import { remultExpress } from 'remult/remult-express'

export const api = remultExpress()
```

2. Add the highlighted code lines to register the middleware in the main server module `index.ts`.

```ts{4,7}
// src/server/index.ts

import express from "express"
import { api } from "./api"

const app = express()
app.use(api)

app.listen(3002, () => console.log("Server started"))
```

### Final tweaks

Our full stack starter project is almost ready. Let's complete these final configurations.

#### Enable TypeScript decorators in the React app

Add the following entry to the `compilerOptions` section of the `tsconfig.json` file to enable the use of decorators in the React app.

```json{7}
// tsconfig.json

{
...
  "compilerOptions": {
    ...
    "experimentalDecorators": true // add this
   ...
  }
...
}

```

#### Proxy API requests from Vite dev server to the API server

The react app created in this tutorial is intended to be served from the same domain as its API.
However, for development, the API server will be listening on `http://localhost:3002`, while the react app is served from the default `http://localhost:5173`.

We'll use the [proxy](https://vitejs.dev/config/#server-proxy) feature of Vite to divert all calls for `http://localhost:5173/api` to our dev API server.

Configure the proxy by adding the following entry to the `vite.config.ts` file:

```ts{7}
// vite.config.ts

//...

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3002" } }
})
```

### Run the app

1. Open a terminal and start the vite dev server.

```sh
npm run dev
```

2. Add an `npm` script named `dev-node` to start the dev API server in the `package.json`.

```json
// package.json

"dev-node": "tsx watch src/server"
```

3. Open another terminal and start the `node` server

```sh
npm run dev-node
```

The server is now running and listening on port 3002. `tsx` is watching for file changes and will restart the server when code changes are saved.

The default "Vite + React" app main screen should be available at the default Vite dev server address [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Remove React default styles

The react default styles won't fit our todo app. If you'd like a nice-looking app, replace the contents of `src/index.css` with [this CSS file](https://raw.githubusercontent.com/remult/react-vite-express-starter/master/src/index.css). Otherwise, you can simply **delete the contents of `src/index.css`**.

### Setup completed

At this point, our starter project is up and running. We are now ready to move to the [next step of the tutorial](./entities.md) and start creating the task list app.
