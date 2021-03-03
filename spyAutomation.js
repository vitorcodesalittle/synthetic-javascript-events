const getTestTextArea = () => document.getElementById("test-textarea");
const getTestButton = () => document.getElementById("test-button");

var namee = "";

function spyAutomation(event) {
  console.log(event);
  if (!event.isTrusted) {
    alert("You are a robot!");
    return;
  }
  namee = event.target.value;
}
function sayHi() {
  console.log(`Hello ${namee}`);
}
getTestTextArea().addEventListener("input", spyAutomation);
getTestButton().addEventListener("click", (event) => {
  sayHi();
  spyAutomation(event);
});
