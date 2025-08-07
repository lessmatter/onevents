/**
 * @typedef {Object} ActionFunctionParams
 * @property {Event} event - The original DOM event
 * @property {HTMLElement} element - The element that has the on-* attribute
 */

/**
 * @typedef {function(ActionFunctionParams): void} ActionFunction
 */

/**
 * @typedef {'click'|'dblclick'|'mousedown'|'mouseup'|'submit'|'input'|'change'|'focus'|'blur'|'focusin'|'focusout'|'reset'|'invalid'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousemove'|'contextmenu'|'touchstart'|'touchend'|'touchmove'|'scroll'|'wheel'|'resize'|'load'|'DOMContentLoaded'|'beforeunload'|'error'|'abort'|'loadstart'|'progress'|'timeout'|'loadend'|'play'|'pause'|'ended'|'volumechange'|'seeking'|'animationend'|'transitionend'} EventName
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
  "focus", "blur", "focusin", "focusout", "reset", "invalid", "keydown", "keyup", "keypress",
  "mouseenter", "mouseleave", "mouseover", "mouseout", "mousemove", "contextmenu",
  "touchstart", "touchend", "touchmove", "scroll", "wheel", "resize", "load",
  "DOMContentLoaded", "beforeunload", "error", "abort", "loadstart", "progress",
  "timeout", "loadend", "play", "pause", "ended", "volumechange", "seeking",
  "animationend", "transitionend"
];

/**
 * Events that cannot be delegated reliably from a container.
 * These either do not bubble and cannot be captured at the container level,
 * or are lifecycle/window-level events that won't reach the provided root.
 * They will be skipped with a warning.
 */
const nonDelegableEvents = new Set([
  "scroll",
  "resize",
  "load",
  "beforeunload",
  "error",
  "abort",
  "DOMContentLoaded",
]);

/**
 * Map certain events to alternative listener types that support delegation.
 * focus/blur do not bubble, but focusin/focusout do.
 */
const eventListenerTypeMap = /** @type {Record<string, string>} */ ({
  focus: "focusin",
  blur: "focusout",
  mouseenter: "mouseover",
  mouseleave: "mouseout",
});

/**
 * Events where passive listeners are beneficial to avoid blocking scrolling.
 */
const passiveEvents = new Set(["touchstart", "touchmove", "wheel"]);

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
        if (validEvents.includes(type)) {
          usedEvents.add(type);
        }
      }
    }
  });

  Array.from(usedEvents).forEach((type) => {
    if (nonDelegableEvents.has(type)) {
      console.warn(
        `onEvents: Skipping non-delegable event '${type}'. Use a bubbling alternative or attach a direct listener.`
      );
      return;
    }

    const listenerType = eventListenerTypeMap[type] || type;

    const handler = function (event) {
      const path = typeof event.composedPath === "function" ? event.composedPath() : null;
      const start = Array.isArray(path) && path.length > 0 ? path[0] : event.target;
      const element = start instanceof Element ? start.closest(`[on-${type}]`) : null;
      if (!element || !root.contains(element)) return;

      // Emulate mouseenter/mouseleave semantics using mouseover/mouseout
      if ((type === "mouseenter" || type === "mouseleave") && element) {
        const related = /** @type {Node|null|undefined} */ (event.relatedTarget);
        if (related && element.contains(related)) {
          return;
        }
      }

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

    const options = passiveEvents.has(listenerType) ? { passive: true } : false;
    root.addEventListener(listenerType, handler, options);
    listeners.push({ type: listenerType, handler });
  });

  return function destroy() {
    listeners.forEach(({ type, handler }) => {
      root.removeEventListener(type, handler);
    });
  };
} 