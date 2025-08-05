# onEvents

Lightweight event delegation library for DOM events using HTML attributes.

> **⚠️ Alpha Version**  
> This library is currently in alpha and being used internally by Less Matter for testing.  
> Breaking changes may occur in future versions.

## Installation

```bash
npm install @lessmatter/onevents
```

## Usage

### 1. Define your action functions

```typescript
import onEvents from '@lessmatter/onevents';

function handleClick(params) {
  console.log('Button clicked!', params.event, params.element);
}

function handleSubmit(params) {
  params.event.preventDefault();
  console.log('Form submitted!');
}

function handleMouseEnter(params) {
  params.element.style.backgroundColor = 'lightblue';
}

// Initialize event delegation
const destroy = onEvents({ 
  actions: { handleClick, handleSubmit, handleMouseEnter }
});
```

### 2. Use in HTML

```html
<button on-click="handleClick">Click me</button>

<form on-submit="handleSubmit">
  <input type="text" />
  <button type="submit">Submit</button>
</form>

<div on-mouseenter="handleMouseEnter" class="card">
  Hover over me
</div>
```

### 3. Cleanup (optional)

```typescript
// Remove all event listeners
destroy();
```

### 4. Dynamic Content (Advanced)

If you have elements that are added to the DOM dynamically (after the initial page load), you can preload event types:

```typescript
// Preload events for dynamic content
const destroy = onEvents({ 
  actions,
  preloadEvents: ['click', 'submit', 'mouseenter'] 
});

// Later, when new elements are added:
document.body.innerHTML += '<button on-click="handleClick">Dynamic Button</button>';
// This button will work immediately without needing to reinitialize onEvents
```

### 5. Scoped Events (Advanced)

You can limit event listening to a specific container element:

```typescript
// Get a specific container
const sidebar = document.querySelector('.sidebar');

// Initialize events only for the sidebar
const destroySidebar = onEvents({ 
  actions: { handleClick, handleMouseEnter },
  root: sidebar
});

// Only elements inside .sidebar will trigger events
// <div class="sidebar">
//   <button on-click="handleClick">Sidebar Button</button>
// </div>
```

```typescript
// Remove all event listeners
destroy();
```

## API

### onEvents(options: OnEventsOptions): () => void

Registers event handlers for DOM events with delegation support using HTML attributes.

#### Parameters

- `options.actions`: Object containing action function names mapped to their implementations
- `options.root` (optional): Root element to listen for events (defaults to `document`). Useful for scoping events to specific containers or improving performance.
- `options.preloadEvents` (optional): Array of event types to preload for dynamic elements that are added later (e.g., `['click', 'submit']`)

#### Action Function Parameters

- `params.event`: The original DOM event
- `params.element`: The element that has the `on-*` attribute

#### Return Value

Returns a cleanup function that removes all registered event listeners.

## Supported Events

The library supports all standard DOM events including:
- Mouse events: `click`, `dblclick`, `mousedown`, `mouseup`, `mouseenter`, `mouseleave`, etc.
- Form events: `submit`, `input`, `change`, `focus`, `blur`, `reset`, `invalid`
- Keyboard events: `keydown`, `keyup`, `keypress`
- Touch events: `touchstart`, `touchend`, `touchmove`
- And many more...

## License

MIT 