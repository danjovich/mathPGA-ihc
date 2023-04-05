const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mode = urlParams.get("mode");

if (!mode) {
  window.open("/", "_self");
}

const intMode = parseInt(mode);

let remainingSeconds = intMode == 1 || intMode == 3 ? 5 : 2;
let intervalId;

function newInterval() {
  clearInterval(intervalId);

  remainingSeconds = intMode == 1 || intMode == 3 ? 5 : 2;

  intervalId = setInterval(() => {
    document.querySelector("#timer").innerHTML = remainingSeconds;
    remainingSeconds--;
  }, 1000);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const radios = new Array(...document.querySelectorAll(".answer"));

class Questions {
  _address = 0;
  _questionNumber = 1;
  _answer = 0;

  _questions = [
    "1 + 1",
    "2 - 3",
    "4 * 5",
    "6 / 2",
    "3 * 5",
    "12 + 13",
    "2 * 60",
    "101 - 4",
  ];

  _hardQuestions = [
    ["1 + 3 + 5 + 7", "16"],
    ["sin^2(x) + cos^2(x)", "1"],
    ["3*ln(e^(5))", "15"],
    ["6!/5!", "6"],
    ["((4 * 5) / 2) + 10", "20"],
    ["5^2 - 4^2 - 3^2", "0"],
    ["Números primos entre 4 e 12 ", "3"],
    ["x^3 - 8 = 0. x", "2"],
  ];

  get currentQuestion() {
    if (intMode <= 2) return this._questions[this._address];
    return this._hardQuestions[this._address][0];
  }

  get currentAnswer() {
    if (intMode <= 2) return eval(this.currentQuestion);
    return this._hardQuestions[this._address][1];
  }

  set address(value) {
    this._address = value;
    this._answer = getRndInteger(0, 3);
    // this._answer = 0;
    // console.log("Resposta:", this._answer);
    this.fillQuestionAndAnswers();
  }

  get address() {
    return this._address;
  }

  get questionNumber() {
    return this._questionNumber;
  }

  set questionNumber(value) {
    this._questionNumber = value;
    this.fillQuestionAndAnswers();
  }

  isAnswerCorrect(answer) {
    return this._answer == answer;
  }

  fillQuestionAndAnswers() {
    document.querySelector("#question-number").innerHTML = this.questionNumber;
    document.querySelector("#question").innerHTML = this.currentQuestion;

    const rndValues = [];
    radios.forEach((_, index) => {
      const answer = this.currentAnswer;

      if (index == this._answer) {
        document.querySelector(`#answer-${index}`).innerHTML = answer;
      } else {
        let value;

        do {
          value = getRndInteger(Math.min(-5, answer), Math.max(5, answer));
        } while (value == answer || rndValues.includes(value));

        rndValues.push(value);

        document.querySelector(`#answer-${index}`).innerHTML = value;
      }
    });
  }
}

const questions = new Questions();
questions.fillQuestionAndAnswers();

function toTwoBitsString(number) {
  const binaryNumber = parseInt(number).toString(2);

  return binaryNumber.length < 2 ? `0${binaryNumber}` : binaryNumber;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

const socket = io("ws://localhost:8080");
const mqttTopics = [
  "teste-T1BB7",
  "perdeu-T1BB7",
  "ganhou-T1BB7",
  "endereco-T1BB7",
];

socket.on("connect", () => {
  mqttTopics.forEach((topic) => {
    console.log(`Connected to ${topic} room`);
    socket.emit("join", topic);
  });

  socket.emit("signal", {
    signal: "1",
    room: "reset-T1BB7",
  });

  sleep(100);

  socket.emit("signal", {
    signal: "0",
    room: "reset-T1BB7",
  });

  sleep(100);

  socket.emit("signal", {
    signal: "1",
    room: "iniciar-T1BB7",
  });

  sleep(100);

  socket.emit("signal", {
    signal: "0",
    room: "iniciar-T1BB7",
  });

  sleep(250);

  socket.emit("signal", {
    signal: toTwoBitsString(intMode - 1),
    room: "botoes-T1BB7",
  });

  // sleep(250);

  newInterval();

  socket.on("signal", ({ signal, topic }) => {
    console.log(`Sinal MQTT recebido: [${topic}] ${signal.toString()}`);
    if (topic === "endereco-T1BB7") {
      questions.address = parseInt(signal.slice(0, 3), 2);
    } else if (topic === "perdeu-T1BB7") {
      window.open("/result.html?result=perdeu", "_self");
    } else if (topic === "ganhou-T1BB7") {
      window.open("/result.html?result=ganhou", "_self");
    }
  });

  document.querySelector("form").onsubmit = (e) => {
    e.preventDefault();

    const answer = radios?.find((radio) => radio.checked).value;

    const signal = answer == questions._answer ? "00" : toTwoBitsString(answer);

    socket.emit("signal", {
      signal,
      room: "botoes-T1BB7",
    });

    newInterval();

    setTimeout(() => {
      questions.questionNumber++;
    }, 1000);
  };
});
