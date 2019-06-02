/* global window, document */

const utils = require("./utils");

exports.handle = (app, backend) => {
  window.addEventListener(
    "keydown",
    e => {
      const code = e.keyCode;
      // space
      if (code === 32) {
        e.preventDefault();
        app.flipCard(true);
      }
      // y
      if (code === 89) {
        app.markCard(true);
      }
      // n
      if (code === 78) {
        app.markCard(false);
      }
      // cmd-s or ctrl-s
      if (code === 83 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        backend
          .save(app.decks)
          .then(backend.load)
          .then(decks => {
            app.decks = decks;
          });
      }
      // r
      if (code === 82 && !(e.ctrlKey || e.metaKey)) {
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
      // left
      if (code === 37) {
        selectCard(-1, 0);
      }
      // right
      if (code === 39) {
        selectCard(1, 0);
      }
      // up
      if (code === 38) {
        selectCard(0, -1);
      }
      // down
      if (code === 40) {
        selectCard(0, 1);
      }
    },
    false
  );

  window.addEventListener(
    "keyup",
    e => {
      const code = e.keyCode;
      // space
      if (code === 32) {
        e.preventDefault();
        app.flipCard(false);
      }
    },
    false
  );
};
