const bookCache = {};
const searchCache = {};

export function getBookFromCache(id) {
  return bookCache[id];
}

export function setBookInCache(id, data) {
  bookCache[id] = data;
}

export function getSearchFromCache(query) {
  return searchCache[query];
}

export function setSearchInCache(query, data) {
  searchCache[query] = data;
}