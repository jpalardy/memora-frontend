const utils = {
  clamp(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  },

  groupBy(arr, iteratee) {
    const result = new Map();
    arr.forEach(item => {
      const key = iteratee(item);
      if (!result.has(key)) {
        result.set(key, []);
      }
      result.get(key).push(item);
    });
    return result;
  },

  indexRagged(haystack, needle) {
    for (let y = 0; y < haystack.length; y += 1) {
      const x = haystack[y].indexOf(needle);
      if (x !== -1) {
        return [x, y];
      }
    }
    return [0, 0];
  },

  findRelativeTo(cards, selectedCard, dx, dy) {
    if (cards.length === 0) {
      return null;
    }
    // up/left: last card -- down/right: first card
    if (!selectedCard) {
      return (dx === 1 || dy === 1) ? cards[0] : cards[cards.length - 1];
    }
    const groups = utils.groupBy(cards, card => card.getBoundingClientRect().top);
    const keys = [...groups.keys()].sort((a, b) => a - b);
    const lines = keys.map(k => groups.get(k));
    let [x, y] = utils.indexRagged(lines, selectedCard);
    if (x === 0 && dx === -1 && y > 0) {
      // wrap left
      y -= 1;
      x = lines[y].length - 1;
    } else if (x === lines[y].length - 1 && dx === 1 && y < lines.length - 1) {
      // wrap right
      y += 1;
      x = 0;
    } else {
      y = utils.clamp(y + dy, 0, lines.length - 1); // order matters!
      x = utils.clamp(x + dx, 0, lines[y].length - 1);
    }
    return lines[y][x];
  },
};

module.exports = utils;
