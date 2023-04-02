const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mode = urlParams.get("mode");

if (!mode) {
  window.open("/", "_self");
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

  get currentQuestion() {
    return this._questions[this._address];
  }

  set address(value) {
    this._address = value;
    this._answer = value % 4;
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

    radios.forEach((_, index) => {
      const answer = eval(this.currentQuestion);

      if (index == this._answer) {
        document.querySelector(`#answer-${index}`).innerHTML = answer;
      } else {
        let value;

        do {
          value = getRndInteger(Math.min(-100, answer), Math.max(100, answer));
        } while (value === answer);

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

  socket.emit("signal", {
    signal: "1",
    room: "iniciar-T1BB7",
  });

  socket.emit("signal", {
    signal: toTwoBitsString(parseInt(mode) - 1),
    room: "botoes-T1BB7",
  });

  socket.on("signal", ({ signal, topic }) => {
    console.log(`topic ${topic.toString()} signal ${signal.toString()}`);

    if (topic === "endereco-T1BB7") {
      questions.address = parseInt(signal, 2);
    } else if (topic === "perdeu-T1BB7") {
      window.open("/result.html?result=perdeu", "_self");
    } else if (topic === "ganhou-T1BB7") {
      window.open("/result.html?result=ganhou", "_self");
    }
  });

  document.querySelector("form").onsubmit = (e) => {
    e.preventDefault();

    console.log(
      questions.isAnswerCorrect(radios?.find((radio) => radio.checked).value)
    );

    socket.emit("signal", {
      signal: toTwoBitsString(radios?.find((radio) => radio.checked).value),
      room: "botoes-T1BB7",
    });

    setTimeout(() => {
      questions.questionNumber++;
    }, 1000);
  };
});

function getOperation(bits) {
  switch (bits) {
    case "00":
      return "+";
    case "01":
      return "-";
    case "10":
      return "X";
    case "11":
      return "/";
    default:
      return "+";
  }
}
