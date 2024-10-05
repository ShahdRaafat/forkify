import View from './View.js';
import icons from 'url:../../img/icons.svg';

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shopping__list');

  _errorMessage =
    'No things to buy yet. Find a nice recipe and its ingredients :)';
  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--delete-ing');
      if (!btn) return;

      const itemEl = btn.closest('.item');
      const id = itemEl.dataset.id;
      if (id) handler(id);
    });
  }

  _generateMarkup() {
    return this._data
      .map(item => {
        return `
        <li class="item" data-id="${item.id}">
                    <div class="item-amount-unit">
                    <input type="number" value="${item.quantity}" class="amount"/>
                    <p class="unit"> ${item.unit}</p> 
                    </div>
                    <p> ${item.description}</p> 
                    <button class="close btn--delete-ing">
                     <svg>
                    <use href="${icons}#icon-circle-with-cross"></use>
                </svg>
                    </button>
                  </li>
      `;
      })
      .join('');
  }
}

export default new ShoppingListView();
