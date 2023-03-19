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
