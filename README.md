# Asynchronous VanJS

This example shows how to create asynchronous VanJS components and
update them periodically. In this case, chart.js graph is updated on a given interval
from mocked JSON API.

VanJS, Typescript, Sass, Webpack, chart.js

## Run (development)

    npm install

    npm run dev

Start mock API:

    npm run server:mock

Edit db.json to modify mocked API response.

## Build

    npm run build

To try it out:

    open public/index.html