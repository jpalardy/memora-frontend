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
      const selectCard = (dx, dy) => {
        e.preventDefault();
        const visibleCards = document.querySelectorAll(".card");
        const selectedCard = document.querySelector(".selected");
        const card = utils.findRelativeTo(visibleCards, selectedCard, dx, dy);
        if (card) {
          // eslint-disable-next-line no-underscore-dangle
          app.selectCard(card.__vue__.card, {source: "keyboard"});
        }
      };
      const selectFirst = () => {
        e.preventDefault();
        const visibleCards = document.querySelectorAll(".card");
        const card = visibleCards[0];
        if (card) {
          // eslint-disable-next-line no-underscore-dangle
          app.selectCard(card.__vue__.card, {source: "keyboard"});
        }
      };
      const selectLast = () => {
        e.preventDefault();
        const visibleCards = document.querySelectorAll(".card");
        const card = visibleCards[visibleCards.length - 1];
        if (card) {
          // eslint-disable-next-line no-underscore-dangle
          app.selectCard(card.__vue__.card, {source: "keyboard"});
        }
      };
      if (e.code === "ArrowLeft") {
        selectCard(-1, 0);
      }
      if (e.code === "ArrowRight") {
        selectCard(1, 0);
      }
      if (e.code === "ArrowUp") {
        selectCard(0, -1);
      }
      if (e.code === "ArrowDown") {
        selectCard(0, 1);
      }
      if (e.code === "Home") {
        selectFirst();
      }
      if (e.code === "End") {
        selectLast();
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
