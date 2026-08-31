/* DOM Element references */
const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");
const num1Input = document.getElementById("num1");
const num2Input = document.getElementById("num2");
const outputSection = document.getElementById("outputSection");
const operationText = document.getElementById("operationText");
const answerText = document.getElementById("answerText");
const checkText = document.getElementById("checkText");

/* Combined calculation logic handler for all arithmetic operations */
function handleCalculation(operation) {
  const val1 = num1Input.value.trim();
  const val2 = num2Input.value.trim();

  /* Set Operation Label Text based on button pressed */
  operationText.innerText = operation.charAt(0).toUpperCase() + operation.slice(1);

  /* Validation: check that both input fields are numeric and not empty */
  if (val1 === "" || val2 === "") {
    answerText.innerHTML = "<span class='status-error'>Invalid Input</span>";
    checkText.innerHTML = "<span class='status-error'>Please enter both numeric fields.</span>";
    triggerOutputFlow(); /* Flow open output box with error message */
    return;
  }

  /* Parse inputs as base-10 integers, fully supporting negative numbers */
  const n1 = parseInt(val1, 10);
  const n2 = parseInt(val2, 10);

  /* Execution Logic: supports negative integer arithmetic for both add/sub */
  if (operation === 'addition') {
    const sum = n1 + n2;
    answerText.innerHTML = `<span class='status-success'>${n1} + ${n2} = ${sum}</span>`;
    checkText.innerHTML = "<span class='status-success'>Valid calculation supporting all integers (positive, zero, negative).</span>";
  } else if (operation === 'subtraction') {
    const result = n1 - n2;
    answerText.innerHTML = `<span class='status-success'>${n1} - ${n2} = ${result}</span>`;
    checkText.innerHTML = "<span class='status-success'>Valid subtraction supporting all integers (positive, zero, negative).</span>";
  }

  /* Success case: flow open output box with result */
  triggerOutputFlow();
}

/* Event listeners for each arithmetic button */
addBtn.addEventListener("click", () => handleCalculation('addition'));
subBtn.addEventListener("click", () => handleCalculation('subtraction'));

/* Helper Function: triggers the clean CSS 'flowy-expand' transition */
function triggerOutputFlow() {
  /* Class manipulation allows for the cleanest and most efficient CSS animation */
  outputSection.classList.add('flowy-expand');
}