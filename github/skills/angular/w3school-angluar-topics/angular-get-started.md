# Angular Get Started

> Source: https://www.w3schools.com/angular/angular_getstarted.asp

## Check Node.js

Angular's tooling runs on Node.js and uses npm to install packages.

Run these to confirm Node.js and npm are installed and on your PATH:

```
node -v
```

This prints your installed Node.js version, like:

```
v20.x.x
```

Angular works best with the current LTS (Long Term Support) release (18 or 20).

If you get a "command not found" error, install Node.js from the Node.js tutorial.

You can also check npm:

```
npm -v
```

npm is Node's package manager.

This prints your npm version, like:

```
10.x.x
```

npm should be automatically installed with Node.js.

## Install Angular CLI

The Angular CLI is the official tool to create, build, and serve Angular apps.

The CLI (Command Line Interface) creates projects, runs a dev server, and provides helpful commands.

Install the Angular CLI globally:

```
npm install -g @angular/cli
```

Installing it globally makes the `ng` command available everywhere.

You can also use `npx` without a global install.

If you hit permission errors, use `npx` or run your terminal with elevated rights.

## Verify Angular CLI

Verify the installation to ensure `ng` is on your PATH and versions are compatible.

```
ng version
```

Displays the Angular CLI, Node.js, and Angular package versions so you can confirm the installation:

```
Angular CLI: 18.x.x
Node: 20.x.x
Package Manager: npm 10.x.x
```

`PATH` is the list of folders your system searches for commands like `ng`.

## Create an Angular Application

Create a project named `my-angular-app`:

```
ng new my-angular-app
```

This creates the project files and folders and installs dependencies.

It may take a few minutes and will ask a few prompts.

**Recommended choices** when prompted:

- Stylesheet format: **CSS** (you can change later)
- Server-side rendering (SSR): **No** for now (you can add later with `ng add @angular/ssr`)
- Zoneless application: **No** for now (you can change later with `ng add @angular/zoneless`)
- Other prompts: keep the defaults

If you don't want to install the CLI globally, you can use `npx`:

```
npx @angular/cli@latest new my-angular-app
```

## Run the Angular Application

```
cd my-angular-app
ng serve
```

`cd` enters your new project folder.

`ng serve` starts a local dev server and watches for changes.

The first build can take a minute.

```
✔ Compiled successfully. ✔ Browser application bundle generation complete.
```

You can add the `--open` flag to automatically open the app in your default browser:

```
ng serve --open
```

By default the dev server runs on `http://localhost:4200`.
