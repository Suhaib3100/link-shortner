const inputUrl = document.querySelector(".inputUrl");
const shortBtn = document.querySelector(".shortBtn");
const resultEl = document.querySelector(".result_container");

const fetchURL = async () => {
  const apiURL =
    "https://tinyurl.com/api-create.php?url=" +
    encodeURIComponent(inputUrl.value);
  fetch(apiURL)
    .then((res) => res.text())
    .then((data) => {
      resultEl.innerHTML = `<span class="shortenedUrl">${data}</span>`;
      resultEl.style.color = "#FFFFFF";
      resultEl.style.fontWeight = "600";
      resultEl.style.justifyContent = "space-between";
    })
    .catch((err) => {
      resultEl.innerHTML = "An error Occurred";
    });
};

inputUrl.addEventListener("keypress", (e) => {
  if (e.key === "ENTER") fetchURL();
});

window.addEventListener("DOMContentLoaded", () => {
  inputUrl.value = "";
  resultEl.innerHTML = "Shortened Url will appear here";
});
