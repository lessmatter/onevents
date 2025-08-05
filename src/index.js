/**
 * @typedef {Object} ActionFunctionParams
 * @property {Event} event - The original DOM event
 * @property {HTMLElement} element - The element that has the on-* attribute
 */

/**
 * @typedef {function(ActionFunctionParams): void} ActionFunction
 */

/**
 * @typedef {'click'|'dblclick'|'mousedown'|'mouseup'|'submit'|'input'|'change'|'focus'|'blur'|'reset'|'invalid'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousemove'|'contextmenu'|'touchstart'|'touchend'|'touchmove'|'scroll'|'wheel'|'resize'|'load'|'DOMContentLoaded'|'beforeunload'|'error'|'abort'|'loadstart'|'progress'|'timeout'|'loadend'|'play'|'pause'|'ended'|'volumechange'|'seeking'|'animationend'|'transitionend'} EventName
 */

/**
 * @typedef {Object} OnEventsOptions
 * @property {Object.<string, ActionFunction>} actions - Object containing action function names mapped to their implementations
 * @property {HTMLElement|Document} [root=document] - Root element to listen for events
 * @property {EventName[]} [preloadEvents=[]] - Array of event types to preload for dynamic elements
 */

/**
 * Valid event names for the library
 * @type {EventName[]}
 */
const validEvents = [
  "click", "dblclick", "mousedown", "mouseup", "submit", "input", "change",
  "focus", "blur", "reset", "invalid", "keydown", "keyup", "keypress",
  "mouseenter", "mouseleave", "mouseover", "mouseout", "mousemove", "contextmenu",
  "touchstart", "touchend", "touchmove", "scroll", "wheel", "resize", "load",
  "DOMContentLoaded", "beforeunload", "error", "abort", "loadstart", "progress",
  "timeout", "loadend", "play", "pause", "ended", "volumechange", "seeking",
  "animationend", "transitionend"
];

/**
 * Helper function to check if event name is valid
 * @param {string} name - Event name to validate
 * @returns {boolean} True if event name is valid
 */
function isValidEventName(name) {
  return validEvents.includes(name);
}

/**
 * Registers event handlers for DOM events with delegation support using HTML attributes.
 * 
 * @param {OnEventsOptions} options - Configuration options
 * @param {Object.<string, ActionFunction>} options.actions - Object containing action function names mapped to their implementations
 * @param {HTMLElement|Document} [options.root=document] - Root element to listen for events
 * @param {EventName[]} [options.preloadEvents=[]] - Array of event types to preload for dynamic elements
 * @returns {function(): void} Cleanup function that removes all registered event listeners
 * 
 * @example
 * ```javascript
 * import onEvents from 'https://raw.githubusercontent.com/lessmatter/onevents/main/src/index.js';
 * 
 * function handleClick(params) {
 *   console.log('Button clicked!', params.element);
 * }
 * 
 * const destroy = onEvents({ 
 *   actions: { handleClick }
 * });
 * 
 * // Later cleanup
 * destroy();
 * ```
 */
export default function onEvents({
  actions,
  root = document,
  preloadEvents = [],
}) {
  if (!actions || typeof actions !== "object") {
    throw new Error('onEvents: "actions" is required and must be an object.');
  }

  const listeners = [];
  const usedEvents = new Set(preloadEvents);

  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on-")) {
        const type = attr.name.slice(3);
        // Runtime check to ensure event is allowed
        if (isValidEventName(type)) {
          usedEvents.add(type);
        }
      }
    }
  });

  Array.from(usedEvents).forEach((type) => {
    const handler = function (event) {
      const target = event.target;
      const element = target?.closest(`[on-${type}]`);
      if (!element || !root.contains(element)) return;

      const fnName = element.getAttribute(`on-${type}`);
      const fn = fnName && actions[fnName];

      if (typeof fn === "function") {
        fn({ event, element });
      } else {
        console.warn(
          `onEvents: Function '${fnName}' not found for event '${type}'.`
        );
      }
    };

    root.addEventListener(type, handler);
    listeners.push({ type, handler });
  });

  return function destroy() {
    listeners.forEach(({ type, handler }) => {
      root.removeEventListener(type, handler);
    });
  };
} 