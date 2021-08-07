/* global window, document */

const utils = require("./utils");

function keysFor(ev) {
  return [
    ev.metaKey && "Meta", // ⏎
    ev.ctrlKey && "Ctrl",
    ev.altKey && "Alt",
    ev.key,
  ]
    .filter((v) => v)
    .join("-");
}

exports.handle = (app, backend) => {
  window.addEventListener(
    "keydown",
    (ev) => {
      const keys = keysFor(ev);
      if (keys === " ") {
        ev.preventDefault();
        app.flipCard(true);
      }
      if (keys === "y") {
        app.markCard(true);
      }
      if (keys === "n") {
        app.markCard(false);
      }
      if (keys === "Meta-s" || keys === "Ctrl-s") {
        ev.preventDefault();
        backend
          .save(app.decks)
          .then(backend.load)
          .then((decks) => {
            app.decks = decks;
          });
      }
      if (keys === "r") {
        app.redoes = !app.redoes;
      }
      //-------------------------------------------------
      const selectCard = (selector) => {
        ev.preventDefault();
        const visibleCards = document.querySelectorAll(".card");
        const selectedCard = document.querySelector(".selected");
        const card = selector(visibleCards, selectedCard);
        if (card) {
          // eslint-disable-next-line no-underscore-dangle
          app.selectCard(card.__vue__.card, {source: "keyboard"});
        }
      };
      if (keys === "ArrowLeft") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, -1, 0));
      }
      if (keys === "ArrowRight") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 1, 0));
      }
      if (keys === "ArrowUp") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 0, -1));
      }
      if (keys === "ArrowDown") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 0, 1));
      }
      if (keys === "Home") {
        selectCard((visibleCards) => visibleCards[0]);
      }
      if (keys === "End") {
        selectCard((visibleCards) => visibleCards[visibleCards.length - 1]);
      }
    },
    false,
  );

  window.addEventListener(
    "keyup",
    (ev) => {
      const keys = keysFor(ev);
      if (keys === " ") {
        ev.preventDefault();
        app.flipCard(false);
      }
    },
    false,
  );
};
