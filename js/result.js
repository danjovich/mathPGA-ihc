const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const result = urlParams.get("result");

if (!result) {
  window.open("/", "_self");
} else {
  document.querySelector("#result").innerHTML = result;
}

