const getRoot = () => document.getElementById("root");
const getSelectorInput = () => document.getElementById("selector");
const getDispatchClickButton = () => document.getElementById("click");
const getDispatchTypingButton = () => document.getElementById("type");

var seletor = "";

const getCurrentTabId = () =>
  new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      var activeTab = tabs[0];
      resolve(activeTab.id);
    });
  });

const sendMessageToContent = async (message) =>
  new Promise(async (resolve) => {
    const tabId = await getCurrentTabId();
    chrome.tabs.sendMessage(tabId, message, {}, resolve);
  });

const getBoundingRectFromContent = async (selector) =>
  sendMessageToContent({
    type: "ELEMENT_INFO",
    selector,
  });

async function fakeClick(selector) {
  console.log(`Selector: ${selector}`);
  const rect = await getBoundingRectFromContent(selector);
  const { x, y } = rect;
  const tabId = await getCurrentTabId();

  return new Promise(async (resolve, reject) => {
    chrome.debugger.attach({ tabId }, "1.2", function () {
      chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
        type: "mousePressed",
        button: "left",
        x,
        y,
        clickCount: 1,
      });
      chrome.debugger.sendCommand(
        { tabId },
        "Input.dispatchMouseEvent",
        {
          type: "mouseReleased",
          button: "left",
          x,
          y,
          clickCount: 1,
        },
        (result) => {
          chrome.debugger.detach({ tabId }, resolve);
        }
      );
    });
  });
}

const typeChar = (tabId, charCode) =>
  new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
      type: "keyDown",
      windowsVirtualKeyCode: parseInt("0x47", 16),
    });
    chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchKeyEvent",
      {
        type: "char",
        text: String.fromCharCode(charCode),
        windowsVirtualKeyCode: charCode,
      },
      resolve
    );
  });

async function fakeType(selector, text) {
  console.log(`Selector: ${selector}, text: ${text}`);
  await fakeClick(selector); // click to focus

  const tabId = await getCurrentTabId();
  return new Promise(async (resolve, reject) => {
    chrome.debugger.attach({ tabId }, "1.2", async () => {
      for (let i = 0; i < text.length; i++) {
        await typeChar(tabId, text.charCodeAt(i));
      }
      chrome.debugger.detach({ tabId }, resolve);
    });
  });
}

getRoot().innerHTML = `
    <div>
        <input id="selector" placeholder="jquery selector" />
        <button id="click">Fake click</button>
        <button id="type">Fake text</button>
    </div>
`;

getSelectorInput().addEventListener("input", (event) => {
  seletor = event.target.value;
});

getDispatchClickButton().addEventListener("click", (event) => {
  fakeClick(seletor);
});

getDispatchTypingButton().addEventListener("click", (event) => {
  let text = prompt("What you wish to type");
  fakeType(seletor, text);
});
