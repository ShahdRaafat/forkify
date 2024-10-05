import View from './View.js';
import { RES_PER_PAGE } from '../config.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
  _generateMarkupNumberOfPages(numOfPages) {
    return `<span class=" cur-page">
        
           ${numOfPages} Pages
           </span>`;
  }
  _generateMarkup() {
    const curPage = this._data.page;
    const numOfPages = Math.ceil(this._data.results.length / RES_PER_PAGE);

    //In the first page and there are other pages
    if (curPage === 1 && numOfPages > 1) {
      return `
      ${this._generateMarkupNumberOfPages(numOfPages)}
      ${this._generateMarkupButton('next', curPage)}
      `;
    }

    //In the last page
    if (curPage === numOfPages && numOfPages > 1) {
      return `
      ${this._generateMarkupButton('prev', curPage)}
      ${this._generateMarkupNumberOfPages(numOfPages)}
      `;
    }

    //In some other page
    if (curPage < numOfPages) {
      return `
        ${this._generateMarkupButton('prev', curPage)}
        ${this._generateMarkupNumberOfPages(numOfPages)}
        ${this._generateMarkupButton('next', curPage)}
         `;
    }

    //The first and only page
    return '';
  }

  _generateMarkupButton(type, page) {
    return `<button data-goto="${
      type === 'prev' ? page - 1 : page + 1
    }" class="btn--inline pagination__btn--${type}">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-${
      type === 'prev' ? 'left' : 'right'
    }"></use>
            </svg>
            <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
          </button>`;
  }
}
export default new PaginationView();
