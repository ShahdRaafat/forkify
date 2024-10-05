import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { CLOSE_MODAL_SEC } from './config.js';
import shoppingListView from './views/shoppingListView.js';

// if (module.hot) {
//   module.hot.accept();
// }
const recipeContainer = document.querySelector('.recipe');

const controlRecipe = async function () {
  try {
    //Getting ID
    const id = window.location.hash.slice(1);

    //Guard Clause
    if (!id) return;

    //Highlight selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //Spinner
    recipeView.renderSpinner();
    //1-Load Recipe
    await model.loadRecipe(id);

    await model.calculateTotalCalories();

    //2-Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1- get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2-load results
    await model.loadSearchResults(query);

    //3-render results
    resultsView.render(model.getSearchResultsPage());
    // resultsView.render(model.state.search.results);

    //4 render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  //1 render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // resultsView.render(model.state.search.results);

  //2 render new pagination buttons
  paginationView.render(model.state.search);
};
const controlServings = async function (newServings) {
  //Update the ingredients and the servings in the state
  model.updateServings(newServings);
  await model.calculateTotalCalories();
  console.log(model.state.recipe);
  //update the recipe view
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  //add/remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //Loading Spinner
    addRecipeView.renderSpinner();
    //Upload the recipe
    await model.uploadRecipe(newRecipe);
    await model.calculateTotalCalories();
    //Rendering recipe
    recipeView.render(model.state.recipe);

    //Render Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);
    bookmarksView.update(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, CLOSE_MODAL_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};
const controlAddToShoppingList = function () {
  model.addToShoppingList(model.state.recipe);
  shoppingListView.render(model.state.shoppingList);
};
const controlDeleteFromShoppingList = function (id) {
  model.deleteFromShoppingList(id);
  shoppingListView.render(model.state.shoppingList);
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerAddToList(controlAddToShoppingList);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUploadRecipe(controlAddRecipe);
  shoppingListView.addHandlerDelete(controlDeleteFromShoppingList);
};
init();

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
