// 🍭 Question sets for each level
let levels = {
    1: [
      { question: "🍬 What is 2 + 2?", options: ["3", "4", "5"], answer: "4" },
      { question: "🍭 Capital of France?", options: ["Paris", "Rome", "London"], answer: "Paris" }
    ],
    2: [
      { question: "🍩 Largest planet?", options: ["Mars", "Earth", "Jupiter"], answer: "Jupiter" },
      { question: "🍪 10 * 5 = ?", options: ["50", "40", "60"], answer: "50" }
    ],
    3: [
      { question: "🍫 Who invented the light bulb?", options: ["Edison", "Newton", "Tesla"], answer: "Edison" },
      { question: "🍯 Which is the fastest land animal?", options: ["Cheetah", "Lion", "Horse"], answer: "Cheetah" }
    ]
  };
  
  let currentQuestion = 0;
  let score = 0;
  let selectedLevel = localStorage.getItem("level");
  
  // Load exam questions on exam.html
  document.addEventListener("DOMContentLoaded", () => {
    let name = localStorage.getItem("username");
  
    if (document.getElementById("welcome")) {
      document.getElementById("welcome").innerText = `Welcome ${name} 🍭 (Level ${selectedLevel})`;
      loadQuestion();
    }
  
    // Falling candy animation
    let candyContainer = document.getElementById("candies");
    if (candyContainer) {
      setInterval(() => {
        let candy = document.createElement("img");
        let candyTypes = ["assets/candy1.png", "assets/candy2.png", "assets/candy3.png", "assets/candy4.png"];
        candy.src = candyTypes[Math.floor(Math.random() * candyTypes.length)];
        candy.classList.add("candy");
  
        // random position + speed
        candy.style.left = Math.random() * window.innerWidth + "px";
        candy.style.animationDuration = (3 + Math.random() * 4) + "s";
  
        candyContainer.appendChild(candy);
  
        // remove after fall
        setTimeout(() => candy.remove(), 7000);
      }, 800);
    }
  });
  
  function loadQuestion() {
    let q = levels[selectedLevel][currentQuestion];
    let container = document.getElementById("question-container");
    container.innerHTML = `
      <h3>${q.question}</h3>
      ${q.options.map(opt => `
        <button class="option-btn" onclick="checkAnswer('${opt}')">${opt}</button>
      `).join('')}
    `;
  }
  
  function checkAnswer(selected) {
    if (selected === levels[selectedLevel][currentQuestion].answer) {
      score++;
    }
    currentQuestion++;
    if (currentQuestion < levels[selectedLevel].length) {
      loadQuestion();
    } else {
      localStorage.setItem("score", score);
      localStorage.setItem("level", selectedLevel);
      window.location.href = "result.html";
    }
  }
  