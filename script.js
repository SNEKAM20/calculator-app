let isUpdated = false;

const calculateBtn = document.getElementById("calculateBtn");
const updateBtn = document.getElementById("updateBtn");
const num1Input = document.getElementById("num1");
const num2Input = document.getElementById("num2");
const outputSection = document.getElementById("outputSection");
const answerText = document.getElementById("answerText");
const checkText = document.getElementById("checkText");
const updateBox = document.getElementById("updateBox");
const versionBadge = document.getElementById("versionBadge");

calculateBtn.addEventListener("click", function () {
  const val1 = num1Input.value.trim();
  const val2 = num2Input.value.trim();

  if (val1 === "" || val2 === "") {
    outputSection.style.display = "block";
    answerText.innerHTML = "<span class='status-error'>Invalid</span>";
    checkText.innerHTML = "<span class='status-error'>Please enter both numbers.</span>";
    updateBox.style.display = "none";
    return;
  }

  const n1 = parseInt(val1, 10);
  const n2 = parseInt(val2, 10);
  outputSection.style.display = "block";

  if (!isUpdated) {
    if (n1 < 0 || n2 < 0) {
      answerText.innerHTML = "<span class='status-error'>Error: Execution Failed</span>";
      checkText.innerHTML = "<span class='status-error'>Production Bug: Negative integers are not supported in Version 1.0.</span>";
      updateBox.style.display = "block";
    } else {
      const sum = n1 + n2;
      answerText.innerHTML = `<span class='status-success'>${n1} + ${n2} = ${sum}</span>`;
      checkText.innerHTML = "<span class='status-success'>Processed successfully.</span>";
      updateBox.style.display = "none";
    }
  } else {
    const sum = n1 + n2;
    answerText.innerHTML = `<span class='status-success'>${n1} + ${n2} = ${sum}</span>`;
    checkText.innerHTML = "<span class='status-success'>Success! Negative and positive integers are fully supported.</span>";
    updateBox.style.display = "none";
  }
});

updateBtn.addEventListener("click", function () {
  isUpdated = true;
  versionBadge.innerText = "Production Fixed (Version 1.0.1)";
  versionBadge.style.background = "#dcfce7";
  versionBadge.style.color = "#15803d";
  calculateBtn.click();
});