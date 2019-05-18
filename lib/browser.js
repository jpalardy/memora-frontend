/* global window, document */

function debounce(f, wait) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => f(...args), wait);
  };
}

exports.waitAndScrollToSelected = debounce(() => {
  const selected = document.getElementsByClassName("selected")[0];
  if (!selected) {
    return;
  }
  const height = selected.offsetHeight;
  const cardTop = selected.offsetTop;
  const cardBot = cardTop + height;
  const scrollTop = window.scrollY;
  const scrollBot = window.innerHeight + scrollTop;
  const paddingTop = 65;
  const paddingBot = 10;
  if (cardTop < scrollTop + paddingTop) {
    window.scrollTo(0, cardTop - paddingTop);
    return;
  }
  if (cardBot > scrollBot - paddingBot) {
    window.scrollTo(0, cardBot - window.innerHeight + paddingBot); // eslint-disable-line no-mixed-operators
  }
}, 100);
