// THE ZODIAC ARCHIVE — shared interactions

document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle. The preference is remembered on this device.
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("zodiac-theme"); } catch (error) {}

  if (savedTheme === "light") document.body.classList.add("light-theme");
  if (themeIcon) themeIcon.textContent = document.body.classList.contains("light-theme") ? "☾" : "☼";

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      if (themeIcon) themeIcon.textContent = isLight ? "☾" : "☼";
      try { localStorage.setItem("zodiac-theme", isLight ? "light" : "dark"); } catch (error) {}
    });
  }

  // Scroll reveal animation. Content remains visible if IntersectionObserver is unavailable.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Element filters on the homepage.
  const filterButtons = document.querySelectorAll(".filter-button");
  const zodiacCards = document.querySelectorAll(".zodiac-card");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      zodiacCards.forEach(card => {
        const show = selected === "all" || card.dataset.element === selected;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Birthday finder.
  const birthdayForm = document.getElementById("birthday-form");
  const birthdayInput = document.getElementById("birthday");
  const birthdayResult = document.getElementById("birthday-result");

  const zodiacDates = [
    { name: "Capricorn", start: [12, 22], end: [1, 19], id: "capricorn" },
    { name: "Aquarius", start: [1, 20], end: [2, 18], id: "aquarius" },
    { name: "Pisces", start: [2, 19], end: [3, 20], id: "pisces" },
    { name: "Aries", start: [3, 21], end: [4, 19], id: "aries" },
    { name: "Taurus", start: [4, 20], end: [5, 20], id: "taurus" },
    { name: "Gemini", start: [5, 21], end: [6, 20], id: "gemini" },
    { name: "Cancer", start: [6, 21], end: [7, 22], id: "cancer" },
    { name: "Leo", start: [7, 23], end: [8, 22], id: "leo" },
    { name: "Virgo", start: [8, 23], end: [9, 22], id: "virgo" },
    { name: "Libra", start: [9, 23], end: [10, 22], id: "libra" },
    { name: "Scorpio", start: [10, 23], end: [11, 21], id: "scorpio" },
    { name: "Sagittarius", start: [11, 22], end: [12, 21], id: "sagittarius" }
  ];

  function findZodiacSign(month, day) {
    for (const sign of zodiacDates) {
      const afterStart = month > sign.start[0] || (month === sign.start[0] && day >= sign.start[1]);
      const beforeEnd = month < sign.end[0] || (month === sign.end[0] && day <= sign.end[1]);
      const crossesYear = sign.start[0] > sign.end[0];
      if (crossesYear ? (afterStart || beforeEnd) : (afterStart && beforeEnd)) return sign;
    }
    return null;
  }

  if (birthdayForm && birthdayInput && birthdayResult) {
    birthdayForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!birthdayInput.value) return;
      const parts = birthdayInput.value.split("-").map(Number);
      const sign = findZodiacSign(parts[1], parts[2]);
      if (sign) {
        birthdayResult.innerHTML = `Your zodiac sign is <strong>${sign.name}</strong>. <a href="zodiac.html#${sign.id}">Explore ${sign.name} ↗</a>`;
      } else {
        birthdayResult.textContent = "We couldn't identify that date. Please try another.";
      }
    });
  }

  // Daily insight. Messages rotate through the collection.
  const insights = [
    ["A thought among the stars", "The universe is always moving. Take a moment to notice the possibilities around you."],
    ["Make room for change", "Growth often begins when you allow yourself to explore a path you have not taken before."],
    ["Find your own rhythm", "Not every season asks you to move quickly. Give yourself space to pause and reset."],
    ["Look a little closer", "Small details can reveal new perspectives. Stay curious about the world around you."],
    ["Trust the process", "Meaningful things take time. Keep moving toward what matters, one step at a time."],
    ["Stay open to connection", "A conversation or a new point of view can change the way you see the world."]
  ];
  const nextInsight = document.getElementById("next-insight");
  const dailyTitle = document.getElementById("daily-title");
  const dailyMessage = document.getElementById("daily-message");
  const dailyNumber = document.getElementById("daily-number");
  let insightIndex = new Date().getDate() % insights.length;

  function showInsight() {
    if (!dailyTitle || !dailyMessage || !dailyNumber) return;
    dailyTitle.textContent = insights[insightIndex][0];
    dailyMessage.textContent = insights[insightIndex][1];
    dailyNumber.textContent = `INSIGHT ${String(insightIndex + 1).padStart(2, "0")}`;
  }
  showInsight();
  if (nextInsight) {
    nextInsight.addEventListener("click", () => {
      insightIndex = (insightIndex + 1) % insights.length;
      showInsight();
    });
  }

  // Compatibility calculator.
  const calculateButton = document.getElementById("calculate-btn");
  const signOne = document.getElementById("sign1");
  const signTwo = document.getElementById("sign2");
  const resultBox = document.getElementById("compatibility-result");

  const zodiacElements = {
    Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
    Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
    Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water"
  };

  const compatibilityData = {
    "Air-Air": { score: 90, title: "A Meeting of Minds", description: "Both signs are associated with communication, ideas, and curiosity. This pairing may enjoy lively conversation, shared interests, and plenty of mental stimulation." },
    "Earth-Earth": { score: 90, title: "A Steady Foundation", description: "Both signs value consistency and practical effort. This pairing may appreciate reliability, shared goals, and building something that lasts." },
    "Fire-Fire": { score: 90, title: "A Spark of Energy", description: "Two fire signs can bring enthusiasm, confidence, and momentum. Their shared intensity can be exciting when both make room for each other." },
    "Water-Water": { score: 90, title: "An Emotional Current", description: "Both signs are associated with feeling, intuition, and empathy. This pairing may value emotional understanding and a strong sense of connection." },
    "Air-Fire": { score: 95, title: "Ideas Meet Inspiration", description: "Air is traditionally said to fuel fire. This pairing can combine curiosity and communication with enthusiasm and action." },
    "Earth-Water": { score: 95, title: "A Nurturing Balance", description: "Earth and water are often viewed as supportive elements. This pairing can bring together steadiness, care, and emotional depth." },
    "Earth-Fire": { score: 70, title: "Different Energies", description: "Fire may move quickly while earth prefers a measured approach. Patience and appreciation for different strengths can help this pairing find balance." },
    "Fire-Water": { score: 65, title: "An Intense Contrast", description: "Fire and water can respond to situations differently. Understanding each other's pace and emotional needs may be especially important." },
    "Air-Earth": { score: 70, title: "Perspective and Practicality", description: "Air brings ideas while earth focuses on tangible results. This pairing may learn from its differences through clear communication." },
    "Air-Water": { score: 65, title: "Head and Heart", description: "Air is associated with thought and water with emotion. This pairing may benefit from making space for both logic and sensitivity." }
  };

  if (calculateButton && signOne && signTwo && resultBox) {
    calculateButton.addEventListener("click", () => {
      const first = signOne.value;
      const second = signTwo.value;

      if (!first || !second) {
        resultBox.innerHTML = '<p class="result-placeholder">Please select both zodiac signs to see your reading.</p>';
        return;
      }

      const firstElement = zodiacElements[first];
      const secondElement = zodiacElements[second];
      const combination = [firstElement, secondElement].sort().join("-");
      const match = compatibilityData[combination];

      if (!match) {
        resultBox.innerHTML = '<p class="result-placeholder">We could not find a reading for that combination. Please try again.</p>';
        return;
      }

      resultBox.innerHTML = `
        <p class="eyebrow">${first.toUpperCase()} + ${second.toUpperCase()}</p>
        <h3 class="result-title">${match.title}</h3>
        <div class="result-score">${match.score}<span>%</span></div>
        <p class="result-description">${match.description}</p>
      `;
    });
  }
  // Custom sign pickers for the compatibility calculator.
  // The original <select> stays in the page as the source of truth (so the calculator code above is unchanged);
  // it is just visually hidden while the picker below is shown.
  const allPickers = [];
  document.querySelectorAll(".sign-input select").forEach(select => {
    const wrapper = select.closest(".sign-input");
    const label = wrapper.querySelector("label");
    const names = Array.from(select.options).filter(option => option.value).map(option => option.value);
    if (!wrapper || !label || !names.length) return;

    select.classList.add("native-select-hidden");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;
    label.id = label.id || `${select.id}-label`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "picker-button";
    button.id = `${select.id}-button`;
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-labelledby", `${label.id} ${button.id}`);

    const buttonIcon = document.createElement("img");
    buttonIcon.className = "picker-icon";
    buttonIcon.alt = "";
    buttonIcon.hidden = true;
    const buttonValue = document.createElement("span");
    buttonValue.className = "picker-value is-placeholder";
    buttonValue.textContent = "Choose a sign";
    const buttonElement = document.createElement("span");
    buttonElement.className = "picker-element";
    const chevron = document.createElement("span");
    chevron.className = "picker-chevron";
    chevron.setAttribute("aria-hidden", "true");
    button.append(buttonIcon, buttonValue, buttonElement, chevron);

    const list = document.createElement("ul");
    list.className = "picker-list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-labelledby", label.id);
    list.hidden = true;

    const options = names.map(name => {
      const item = document.createElement("li");
      item.className = "picker-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.tabIndex = -1;
      item.dataset.value = name;
      const icon = document.createElement("img");
      icon.src = `images/icons8-${name.toLowerCase()}-50.png`;
      icon.alt = "";
      const text = document.createElement("span");
      text.textContent = name;
      const element = document.createElement("small");
      element.textContent = (zodiacElements[name] || "").toUpperCase();
      item.append(icon, text, element);
      list.appendChild(item);
      return item;
    });

    wrapper.append(button, list);

    const picker = { close };
    allPickers.push(picker);

    function isOpen() { return !list.hidden; }

    function open() {
      allPickers.forEach(other => { if (other !== picker) other.close(); });
      list.hidden = false;
      wrapper.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      const selected = options.find(option => option.getAttribute("aria-selected") === "true");
      (selected || options[0]).focus();
    }

    function close() {
      list.hidden = true;
      wrapper.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }

    function choose(name) {
      select.value = name;
      buttonIcon.src = `images/icons8-${name.toLowerCase()}-50.png`;
      buttonIcon.hidden = false;
      buttonValue.textContent = name;
      buttonValue.classList.remove("is-placeholder");
      buttonElement.textContent = (zodiacElements[name] || "").toUpperCase();
      options.forEach(option => option.setAttribute("aria-selected", String(option.dataset.value === name)));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      button.focus();
    }

    button.addEventListener("click", () => (isOpen() ? close() : open()));
    button.addEventListener("keydown", event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen()) open();
      }
    });
    label.addEventListener("click", () => button.focus());

    list.addEventListener("click", event => {
      const option = event.target.closest(".picker-option");
      if (option) choose(option.dataset.value);
    });
    list.addEventListener("keydown", event => {
      const current = options.indexOf(document.activeElement);
      let next = null;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (current + 1) % options.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (current - 1 + options.length) % options.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = options.length - 1;
      else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (current >= 0) choose(options[current].dataset.value);
        return;
      } else if (event.key === "Escape") {
        event.preventDefault();
        close();
        button.focus();
        return;
      } else if (event.key === "Tab") {
        close();
        return;
      }
      if (next !== null) {
        event.preventDefault();
        options[next].focus();
      }
    });

    document.addEventListener("click", event => {
      if (isOpen() && !wrapper.contains(event.target)) close();
    });
  });

  // Tarot-style zodiac deck (zodiac page): shuffle, draw, and go back through the cards.
  const deckCard = document.getElementById("tarot-card");
  const deckFront = document.getElementById("tarot-front");
  const deckReading = document.getElementById("deck-reading");
  const deckCount = document.getElementById("deck-count");
  const drawButton = document.getElementById("deck-draw");
  const prevButton = document.getElementById("deck-prev");
  const shuffleButton = document.getElementById("deck-shuffle");

  const deckSigns = [
    { id: "aries", name: "Aries", dates: "March 21 – April 19", element: "Fire", tagline: "The Initiator", text: "The first sign of the zodiac, traditionally associated with beginnings, initiative, and a forward-moving spirit.", traits: "Confidence, energy, independence, directness." },
    { id: "taurus", name: "Taurus", dates: "April 20 – May 20", element: "Earth", tagline: "The Grounded One", text: "An earth sign traditionally connected with stability, patience, and an appreciation for comfort and beauty.", traits: "Reliability, loyalty, persistence, practicality." },
    { id: "gemini", name: "Gemini", dates: "May 21 – June 20", element: "Air", tagline: "The Communicator", text: "An air sign associated with curiosity, communication, and learning from many different perspectives.", traits: "Curiosity, wit, versatility, sociability." },
    { id: "cancer", name: "Cancer", dates: "June 21 – July 22", element: "Water", tagline: "The Nurturer", text: "A water sign traditionally associated with emotional awareness, home, and a sense of belonging.", traits: "Empathy, protectiveness, intuition, devotion." },
    { id: "leo", name: "Leo", dates: "July 23 – August 22", element: "Fire", tagline: "The Creator", text: "A fire sign associated with creativity, self-expression, and warmth, drawing on the symbolism of the lion and the Sun.", traits: "Confidence, generosity, creativity, enthusiasm." },
    { id: "virgo", name: "Virgo", dates: "August 23 – September 22", element: "Earth", tagline: "The Analyst", text: "An earth sign traditionally linked with discernment, service, and careful attention to detail.", traits: "Precision, helpfulness, organization, thoughtfulness." },
    { id: "libra", name: "Libra", dates: "September 23 – October 22", element: "Air", tagline: "The Harmonizer", text: "An air sign associated with balance, relationships, and aesthetics, symbolized by the scales of fairness.", traits: "Diplomacy, cooperation, charm, fairness." },
    { id: "scorpio", name: "Scorpio", dates: "October 23 – November 21", element: "Water", tagline: "The Investigator", text: "A water sign traditionally connected with depth, transformation, and a willingness to explore what lies beneath the surface.", traits: "Determination, insight, loyalty, resourcefulness." },
    { id: "sagittarius", name: "Sagittarius", dates: "November 22 – December 21", element: "Fire", tagline: "The Explorer", text: "A fire sign associated with exploration, philosophy, and the search for meaning, pointing toward distant horizons.", traits: "Optimism, independence, curiosity, adventurousness." },
    { id: "capricorn", name: "Capricorn", dates: "December 22 – January 19", element: "Earth", tagline: "The Architect", text: "An earth sign traditionally associated with ambition, responsibility, and the steady pursuit of long-term goals.", traits: "Discipline, patience, practicality, determination." },
    { id: "aquarius", name: "Aquarius", dates: "January 20 – February 18", element: "Air", tagline: "The Visionary", text: "An air sign associated with innovation, independence, and collective ideas, with a perspective that looks to the future.", traits: "Originality, idealism, independence, inventiveness." },
    { id: "pisces", name: "Pisces", dates: "February 19 – March 20", element: "Water", tagline: "The Dreamer", text: "A water sign traditionally connected with imagination, compassion, and the fluid boundary between inner and outer worlds.", traits: "Empathy, imagination, sensitivity, creativity." }
  ];

  if (deckCard && deckFront && deckReading && deckCount && drawButton && prevButton && shuffleButton) {
    let deckOrder = deckSigns.slice();
    let deckIndex = -1; // -1 means the deck is face down
    let flipTimer = null;

    function shuffleDeck() {
      // Fisher-Yates shuffle
      for (let i = deckOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckOrder[i], deckOrder[j]] = [deckOrder[j], deckOrder[i]];
      }
    }

    function renderReading() {
      if (deckIndex < 0) {
        deckReading.innerHTML = '<p class="result-placeholder">Your card will be revealed here.</p>';
        deckCount.textContent = "12 CARDS / FACE DOWN";
        prevButton.disabled = true;
        drawButton.textContent = "Draw a card ";
        drawButton.insertAdjacentHTML("beforeend", "<span>↗</span>");
        return;
      }
      const sign = deckOrder[deckIndex];
      deckReading.innerHTML = `
        <p class="eyebrow">${sign.dates.toUpperCase()} / ${sign.element.toUpperCase()}</p>
        <h3>${sign.name}</h3>
        <p class="sign-tagline">${sign.tagline}</p>
        <p>${sign.text}</p>
        <p class="deck-traits"><strong>Often associated with:</strong> ${sign.traits}</p>
        <a href="#${sign.id}">Read the full ${sign.name} profile ↓</a>
      `;
      deckCount.textContent = `CARD ${deckIndex + 1} OF 12`;
      prevButton.disabled = deckIndex === 0;
      drawButton.textContent = deckIndex === deckOrder.length - 1 ? "Draw again " : "Next card ";
      drawButton.insertAdjacentHTML("beforeend", "<span>↗</span>");
    }

    function showCard(newIndex) {
      clearTimeout(flipTimer);
      const wasFaceUp = deckCard.classList.contains("is-flipped");
      deckIndex = newIndex;
      const sign = deckOrder[deckIndex];
      const reveal = () => {
        deckFront.src = `images/cards/${sign.id}.svg`;
        deckFront.alt = `${sign.name} tarot-style card showing the ${sign.name} constellation`;
        deckCard.classList.add("is-flipped");
        renderReading();
      };
      if (wasFaceUp) {
        deckCard.classList.remove("is-flipped");
        flipTimer = setTimeout(reveal, 320);
      } else {
        reveal();
      }
    }

    function drawNext() {
      // After the last card, reshuffle and start over.
      if (deckIndex === deckOrder.length - 1) {
        shuffleDeck();
        showCard(0);
      } else {
        showCard(deckIndex + 1);
      }
    }

    drawButton.addEventListener("click", drawNext);
    deckCard.addEventListener("click", drawNext);
    prevButton.addEventListener("click", () => { if (deckIndex > 0) showCard(deckIndex - 1); });
    shuffleButton.addEventListener("click", () => {
      clearTimeout(flipTimer);
      deckCard.classList.remove("is-flipped");
      deckCard.classList.remove("is-shuffling");
      void deckCard.offsetWidth; // restart the animation
      deckCard.classList.add("is-shuffling");
      shuffleDeck();
      deckIndex = -1;
      renderReading();
    });
    deckCard.addEventListener("animationend", () => deckCard.classList.remove("is-shuffling"));
  }
});
