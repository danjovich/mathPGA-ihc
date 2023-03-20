const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mode = urlParams.get("mode");

if (!mode) {
  window.open("/", "_self");
}

document.querySelectorAll(".header-button").forEach((value) => {
  value.innerHTML.includes(mode) && value.classList.add("active");
});

const options = {
  clean: true, // retain session
  connectTimeout: 30000, // Timeout period increased to 30 seconds
  // Authentication information
  clientId: "foobar_test_random" + Math.floor(Math.random() * 10000),
};

const client = mqtt.connect("wss://test.mosquitto.org:8081", options);

client.on("connect", function () {
  client.subscribe("presence", function (err) {
    if (!err) {
      client.publish("presence", "Hello mqtt");
    }
  });
});

client.on("message", function (topic, message) {
  // message is Buffer
  console.log('Message received:', message.toString(), topic);
  client.end();
});

class Questions {
  questionCount = 0;

  _questions = [
    "0000000000",
    "1001011000",
    "0010100001",
    "0110110010",
    "0111010101",
    "0001110001",
    "1001100000",
    "0100010100",
    "0000000001",
    "0001100001",
    "0100110010",
    "0001000001",
    "0011100001",
    "1000010101",
    "0000111001",
    "0001100010",
  ];

  _answers = [
    "0001",
    "0010",
    "0100",
    "1000",
    "0100",
    "0010",
    "0001",
    "0001",
    "0010",
    "0010",
    "0100",
    "0100",
    "1000",
    "1000",
    "0001",
    "0100",
  ];

  get currentQuestion() {
    return this._questions[this.questionCount];
  }

  isAnswerCorrect(answer) {
    return this._answers[this.questionCount].split('').reverse().findIndex((value) => value === '1') == answer;
  }
}

const questions = new Questions();

const radios = Array(...document.querySelectorAll(".answer"));

const getOperation = (bits)  => {
  switch (bits) {
    case '00':
      return '+';
    case '01':
      return '-';
    case '10':
      return 'X';
    case '11':
      return '/';
    default:
      return '+';
  }
}

const fillQuestionAndAnswers = () => {
  const firstNumber = parseInt(questions.currentQuestion.substring(0, 4), 2);
  const operation = getOperation(questions.currentQuestion.substring(4, 6));
  const secondNumber = parseInt(questions.currentQuestion.substring(6), 2);
  console.log("Numbers:", firstNumber, operation, secondNumber);

  document.querySelector('#first-number').innerHTML = firstNumber;
  document.querySelector('#op').innerHTML = operation;
  document.querySelector('#second-number').innerHTML = secondNumber;

  // radios.forEach(())
}

fillQuestionAndAnswers();

document.querySelector("form").onsubmit = (e) => {
  e.preventDefault();

  console.log(questions.isAnswerCorrect(radios.find((radio) => radio.checked).value));

  setTimeout(() => {
    questions.questionCount++;
    fillQuestionAndAnswers();
  }, 2000);
};
