# Starting up

First you need to install the dependencies by running `npm i`.

Next, create a `.env` file that will have the following variables:

- MICROSOFT_APP_ID
- MICROSOFT_APP_PASSWORD
- LUIS_MODEL_URL
- BING_SEARCH_KEY

You can obtain that information on [BotFramework](https://dev.botframework.com). Generate a new bot to get the APP_ID and APP_PASSWORD.

Next, you need to start the bot. Just run `node app.js`, and the bot will be running on `localhost:3978`.

To interact with the bot, use [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/), you can find instructions on how to install it there.