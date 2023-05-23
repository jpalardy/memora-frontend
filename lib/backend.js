/* global dayjs */

const scheduler = require("./scheduler");

exports.load = () => fetch("/decks.json")
  .then(response => response.json())
  .then(decks => {
    decks.forEach((deck, i) => {
      deck.key = `deck-${i}`;
      deck.cards = deck.cards || []; // backend returns null... FIXME
      /* eslint-disable-next-line no-shadow */
      deck.cards.forEach((card, i) => {
        card.key = `card-${i}`;
        card.selected = false;
        card.flipped = false;
        card.passed = null;
      });
      // shuffle cards
      deck.cards.sort(() => Math.random() - 0.5);
    });
    return decks;
  });

exports.save = decks => {
  const updatedDecks = decks
    .filter(deck => deck.cards.some(card => card.passed !== null))
    .map(deck => {
      const result = {
        filename: deck.filename,
        updates: {},
      };
      deck.cards
        .filter(card => card.passed !== null)
        .forEach(card => {
          const days = scheduler.daysUntilNext(card.passed, card.last);
          const next = dayjs()
            .add(days, "days")
            .format("YYYY-MM-DD");
          result.updates[card.question] = {mark: card.passed ? 1 : 0, next};
        });
      return result;
    });
  if (updatedDecks.length === 0) {
    return Promise.resolve(); // don't save... no point
  }
  return fetch("/decks", {
    method: "POST",
    headers: new Headers({"Content-Type": "application/json"}),
    body: JSON.stringify(updatedDecks),
  });
};
