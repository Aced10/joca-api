# API challenge solution

## npm install

* Clone project
* Download or create .end file in root folder and copy enviroment variables.
* Run npm install command to install all dependencies

## DB configuration

Make sure you have the local mongoDB server up and running on port 27017.
Optional, the API is connect with test DB online

## API Documentation

You can open this in your browser to see API Documentation [Swagger](http://localhost:3000/api/docs).

## Create Docker Image

1. Open terminal in root folder.
2. Run command "docker build -t your-image-name ."
3. Run the Docker Container "docker run -p 3000:3000 -d your-image-name"

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the production mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm start-dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\

### `npm test`

Comman to run unit test
