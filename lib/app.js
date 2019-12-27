/* global Vue, window, document */

const scheduler = require("./scheduler");
const backend = require("./backend");
const keyboard = require("./keyboard");
const browser = require("./browser");

const app = new Vue({
  el: "#decks",
  template: `
    <div id="decks" class="container">
      <deck :deck="deck" :key="deck.key" v-for="deck in decks">
      </deck>
    </div>
  `,
  data: {
    decks: [],
    selectedCard: null,
    redoes: false,
    mouse: true, // turns off on keyboard, back on when moving
  },
  methods: {
    toggleMouse(state) {
      if (this.mouse === state) {
        return;
      }
      this.mouse = state;
      document.body.classList.toggle("mouse-off", !state);
    },
    selectCard(card, {source}) {
      if (this.selectedCard) {
        this.selectedCard.flipped = false;
        this.selectedCard.selected = false;
      }
      this.selectedCard = card;
      this.selectedCard.flipped = false;
      this.selectedCard.selected = true;
      if (source === "keyboard") {
        this.toggleMouse(false);
        // move to selected card if off-screen
        browser.waitAndScrollToSelected();
      }
    },
    markCard(passed) {
      if (!this.selectedCard) {
        return;
      }
      this.selectedCard.passed = passed;
    },
    flipCard(flipped) {
      if (!this.selectedCard) {
        return;
      }
      this.selectedCard.flipped = flipped;
    },
    handleMouse() {
      this.toggleMouse(true);
    },
  },
  mounted() {
    backend.load().then(decks => {
      this.decks = decks;
    });
  },
  created() {
    window.addEventListener("mousemove", this.handleMouse);
  },
  destroyed() {
    window.removeEventListener("mousemove", this.handleMouse);
  },
});

Vue.component("deck", {
  props: ["deck"],
  template: `
    <div class="deck">
      <hgroup>
        <h2>{{ deck.filename }}</h2>
        <h3 class="subtext">{{ isLimited ? limit + " of " : ""}}{{ filteredCards | pluralize('card') }}</h3>
      </hgroup>
      <div class="cards">
        <card :card="card" :key="card.key" v-for="card in limitedCards"></card>
      </div>
      <div v-if="isLimited">
        <button @click="limit += 12"><span class="discoverable">{{ remainingCards | pluralize('card') }} left</span>...</button>
      </div>
    </div>
  `,
  data() {
    return {
      limit: 12,
    };
  },
  computed: {
    filteredCards() {
      return this.deck.cards.filter(card => app.redoes || !card.last || scheduler.daysSince(card.last) > 0);
    },
    isLimited() {
      return this.filteredCards.length > this.limit;
    },
    limitedCards() {
      return this.filteredCards.slice(0, this.limit);
    },
    remainingCards() {
      return this.filteredCards.slice(this.limit);
    },
  },
});

Vue.component("card", {
  props: ["card"],
  template: `
    <div class="card" :class="classes"
         @mouseenter="select" @mousedown="flip(true)" @mouseup="flip(false)">
      <span class="text" v-html="text"></span>
      <span class="preview">{{ preview }}</span>
    </div>
  `,
  computed: {
    text() {
      return this.card.flipped ? this.card.answer : this.card.question;
    },
    classes() {
      const result = {
        selected: this.card.selected,
        passed: this.card.passed,
        failed: false,
      };
      // avoid null
      if (this.card.passed === false) {
        result.failed = true;
      }
      return result;
    },
    preview() {
      const [minDays, maxDays] = scheduler.daysPreview(this.card.last);
      return minDays === 0 ? "1 day" : `${minDays}..${maxDays} days`;
    },
  },
  methods: {
    select() {
      app.selectCard(this.card, {source: "mouse"});
    },
    flip(flipped) {
      app.selectCard(this.card, {source: "mouse"});
      this.card.flipped = flipped;
    },
  },
});

//-------------------------------------------------

Vue.filter("pluralize", (count, singular, plural = `${singular}s`) => {
  if ("length" in count) {
    count = count.length;
  }
  if (count === 0) {
    return `no ${plural}`;
  }
  if (count === 1) {
    return `1 ${singular}`;
  }
  return `${count} ${plural}`;
});

//-------------------------------------------------

keyboard.handle(app, backend);

window.app = app;
