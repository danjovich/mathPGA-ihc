const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mode = urlParams.get("mode");

if (!mode) {
  window.open("/", "_self");
}

document.querySelectorAll(".header-button").forEach((value) => {
  value.innerHTML.includes(mode) && value.classList.add("active");
});

document.querySelector("form").onsubmit = (e) => {
  e.preventDefault();
  const radios = Array(...document.querySelectorAll(".answer")).map((radio) => [
    radio.value,
    radio.checked,
  ]);

  console.log(radios.find((radio) => radio[1])[0]);
};


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