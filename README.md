# react-gulp-app-shell

Installation
--------------

#### Install gulp, babel, react and all other project dependencies via
```sh
$ npm install
```

#### Running sanity checks on npm and babel
```sh
npm run check
```
This will identify candidates for upgrade and other npm or babel related issues.


Developing
--------------

Files are complied into /dist folder, do not commit these.

#### Running a dev server with a single command:
```sh
npm run dev-server
```
This will start the node server for you (if it is not already running), build all _unchanged_ files, and watch the sources.

Access on port 8080 or with browser-sync proxy form port 300x

[http://localhost:8080](http://localhost:8080)
[http://localhost:3000](http://localhost:3000)

### Optional steps

#### Running a dev server on port 8080
```sh
npm start
```
This is not needed if you run `dev-server` as it will handle it for you.

#### Linting your React and ES6 code 
```sh
npm run lint
```

#### If you want to auto fix the lint issues run: 
```sh
npm run fix
```

#### Build only, will not start server:
```sh
npm run build
```
Note: builds will process only _changed_ files int he source dir


#### Watch then build and browser sync cycle (requires running server on port 8080):
```sh
npm run watch
```

#### Do a clean build over all source files
```sh
npm run clean
```
