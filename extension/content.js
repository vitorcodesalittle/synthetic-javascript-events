// /**
//  * @see https://developer.chrome.com/docs/extensions/reference/debugger/#type-Debuggee
//  * @typedef {{ extensionId: string, tabId: number, targetId: number}} Debugee
//  */

// const getCurrentTabId = () =>
//   new Promise((resolve) => {
//     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//       var activeTab = tabs[0];
//       resolve(activeTab.id);
//     });
//   });

// const dispatchDebuggerEvent = (target, version = "1.2", eventName, eventArgs) =>
//   new Promise((resolve) => {
//     try {
//       chrome.debugger.attach(target, version, function () {
//         try {
//           chrome.debugger.sendCommand(target, eventName, eventArgs, resolve);
//         } catch (err) {
//           reject(err);
//         }
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });

// async function debuggerClick(selector) {
//   const tabId = await getCurrentTabId();
// }

// async function debuggerType(selector, text) {
//   const tabId = await getCurrentTabId();
//   const target = {
//       tabId, targetId
//   }
// }

const handleMessagesWithRunner = async (request, sender, sendResponse) => {
  const { type, selector } = request;
  switch (type) {
    case "ELEMENT_INFO":
      const el = document.querySelector(selector);
      console.log(el);
      if (!el)
        return sendResponse(
          new Error("Not element found matching " + selector)
        );
      const rect = el.getBoundingClientRect();

      sendResponse(rect);
      break;
    default:
      sendResponse(new Error(`Unknown command ${request.type}`));
      break;
  }
};

chrome.runtime.onMessage.addListener(handleMessagesWithRunner);
