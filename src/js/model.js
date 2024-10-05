// import { async } from 'regeneratorRuntime';
import { API_URL, KEY, SPOONACULAR_KEY, SPOONACULAR_URL } from './config.js';
import { AJAX } from './helpers.js';
import { RES_PER_PAGE } from './config.js';

// Import the UUID library
const { v4: uuidv4 } = require('uuid');
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  shoppingList: [],
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    console.error(err);
  }
};
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;
  return state.search.results.slice(start, end);
};
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};
export const storeBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
  //Adding recipe to bookmarks array
  state.bookmarks.push(recipe);
  //Marking it as bookmarked
  if (recipe.id === state.recipe.id) recipe.bookmarked = true;

  storeBookmarks();
};
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  //Removing bookmark
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  storeBookmarks();
};
export const uploadRecipe = async function (newRecipe) {
  try {
    //Making the ingredients array
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient fromat! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    //Making recipe object in the format that is suitable with API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    //Sending to API
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export const addToShoppingList = function (recipe) {
  recipe.ingredients.map(ing => {
    const item = {
      id: uuidv4(),
      quantity: ing.quantity,
      unit: ing.unit,
      description: ing.description,
    };
    state.shoppingList.push(item);
  });
};
export const deleteFromShoppingList = function (id) {
  const index = state.shoppingList.findIndex(ing => ing.id === id);
  state.shoppingList.splice(index, 1);
  console.log(state.shoppingList);
};
export const getIngId = async function (ing) {
  try {
    if (!ing || !ing.description) throw new Error('Ingredient is undefined');
    const data = await AJAX(
      `${SPOONACULAR_URL}search?query=${ing.description}&apiKey=${SPOONACULAR_KEY}`
    );
    return data.results[0]?.id;
  } catch (err) {
    console.error(err);
  }
};
export const getIngCalories = async function (ing) {
  try {
    const ingredientId = await getIngId(ing);
    if (!ingredientId) return;
    const data = await AJAX(
      `${SPOONACULAR_URL}${ingredientId}/information?amount=${ing.quantity}&unit=${ing.unit}&apiKey=${SPOONACULAR_KEY}`
    );
    console.log(data);

    const calories = data.nutrition.nutrients.find(
      nutrient => nutrient.name === 'Calories'
    );
    return calories?.amount || 0;
  } catch (err) {
    console.error(err);
  }
};
export const calculateTotalCalories = async function () {
  try {
    const caloriesPromises = state.recipe.ingredients.map(ing =>
      getIngCalories(ing)
    );
    console.log(caloriesPromises);

    const caloriesArray = await Promise.all(caloriesPromises);
    console.log(caloriesArray);

    const totalCalories = caloriesArray
      .reduce((acc, cal) => acc + (cal || 0), 0)
      .toFixed(2);
    console.log(totalCalories);
    state.recipe.calories = totalCalories;
    return totalCalories;
  } catch (err) {
    console.error(err);
  }
};
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
