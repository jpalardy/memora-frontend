/* global window, document */

const utils = require("./utils");

exports.handle = (app, backend) => {
  window.addEventListener(
    "keydown",
    e => {
      if (e.code === "Space") {
        e.preventDefault();
        app.flipCard(true);
      }
      if (e.code === "KeyY") {
        app.markCard(true);
      }
      if (e.code === "KeyN") {
        app.markCard(false);
      }
      // cmd-s or ctrl-s
      if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        backend
          .save(app.decks)
          .then(backend.load)
          .then(decks => {
            app.decks = decks;
          });
      }
      if (e.code === "KeyR" && !(e.ctrlKey || e.metaKey)) {
        app.redoes = !app.redoes;
      }
      //-------------------------------------------------
      const selectCard = (selector) => {
        e.preventDefault();
        const visibleCards = document.querySelectorAll(".card");
        const selectedCard = document.querySelector(".selected");
        const card = selector(visibleCards, selectedCard);
        if (card) {
          // eslint-disable-next-line no-underscore-dangle
          app.selectCard(card.__vue__.card, {source: "keyboard"});
        }
      };
      if (e.code === "ArrowLeft") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, -1, 0));
      }
      if (e.code === "ArrowRight") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 1, 0));
      }
      if (e.code === "ArrowUp") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 0, -1));
      }
      if (e.code === "ArrowDown") {
        selectCard((visibleCards, selectedCard) => utils.findRelativeTo(visibleCards, selectedCard, 0, 1));
      }
      if (e.code === "Home") {
        selectCard((visibleCards) => visibleCards[0]);
      }
      if (e.code === "End") {
        selectCard((visibleCards) => visibleCards[visibleCards.length - 1]);
      }
    },
    false,
  );

  window.addEventListener(
    "keyup",
    e => {
      if (e.code === "Space") {
        e.preventDefault();
        app.flipCard(false);
      }
    },
    false,
  );
};
