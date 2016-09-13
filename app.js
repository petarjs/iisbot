require('dotenv').config()
var restify = require('restify');
var builder = require('botbuilder');

var Intent = require('./intents.enum').intents;
var Search = require('./search');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);

var model = process.env.LUIS_MODEL_URL;
var recognizer = new builder.LuisRecognizer(model);

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//=========================================================
// Intent Handlers
//=========================================================

dialog.matches(Intent.FindRecipe, [dialogFindFood, dialogGetRecipe, dialogChooseRecipe, dialogShowChosenRecipe]);
dialog.matches(Intent.GetShoppingList, [dialogFindFood, dialogGetIngredients, dialogChooseIngredients, dialogShowChosenIngredients]);
dialog.matches(Intent.None, builder.DialogAction.send("I'm sorry I didn't understand. I can only search for recipes and ingredients."));
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only search for recipes and ingredients."));

function dialogFindFood(session, args, next) {
  var foodEntity = builder.EntityRecognizer.findEntity(args.entities, 'Food');
  var intent = args.intent;
  
  session.dialogData.food = foodEntity ? foodEntity.entity : null;

  if(!foodEntity) {
    var prompt = intent === Intent.FindRecipe ? 'Sorry, a recipe for what?' : 'Sorry, ingredients for what?';
    builder.Prompts.text(session, prompt);
  } else {
    next();
  }
}

function dialogGetRecipe(session, results, next) {
  var food = session.dialogData.food;
  if(results.response) {
    food = results.response;
  }

  session.sendTyping();
  Search
    .search(food + ' recipes')
    .then(function(recipes) {
      console.log(recipes)
      session.dialogData.recipes = recipes;
      next();
    })
    .catch(function(er) {
      console.log(er)
      session.error(er)
    });
}

function dialogChooseRecipe(session, results, next) {
  var recipes = session.dialogData.recipes;

  var recipesFormatted = recipes.map(function(recipe) {
    return recipe.name + ' - ' + recipe.snippet;
  });
  builder.Prompts.choice(session, 'Here are the recipes I found. Which one would you like?', recipesFormatted);
}

function dialogShowChosenRecipe(session, results, next) {
  var recipes = session.dialogData.recipes;

  var chosenRecipe = '';
  if(results.response) {
    chosenRecipe = recipes[results.response.index];
    session.send('Great choice! You can find the recipe at this url: ' + chosenRecipe.url);
    session.endConversation();
  }
}

function dialogGetIngredients(session, results, next) {
  var food = session.dialogData.food;
  if(results.response) {
    food = results.response;
  }

  session.sendTyping();
  Search
    .search(food + ' ingredients')
    .then(function(shoppingLists) {
      console.log(shoppingLists)
      session.dialogData.ingredients = shoppingLists;
      next();
    })
    .catch(function(er) {
      console.log(er)
      session.error(er)
    });
}

function dialogChooseIngredients(session, results, next) {
  var ingredients = session.dialogData.ingredients;

  var ingredientsFormatted = ingredients.map(function(ingredient) {
    return ingredient.name + ' - ' + ingredient.snippet;
  });
  builder.Prompts.choice(session, 'Here are the shopping lists I found. Which one would you like to view?', ingredientsFormatted);
}

function dialogShowChosenIngredients(session, results, next) {
  var ingredients = session.dialogData.ingredients;

  var chosenIngredients = '';
  if(results.response) {
    chosenIngredients = ingredients[results.response.index];
    session.send('Great choice! You can find the shopping list at this url: ' + chosenIngredients.url);
    session.endConversation();
  }
}