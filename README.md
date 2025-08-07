# onEvents by Less Matter

Lightweight event delegation library for DOM events using HTML attributes.

> **⚠️ Alpha Version**  
> This library is currently in alpha and being used internally by Less Matter for testing.  
> Breaking changes may occur in future versions.

## Installation

Import directly via jsDelivr (recommended for alpha):

```html
<script type="module">
  import onEvents from 'https://cdn.jsdelivr.net/gh/lessmatter/onevents@main/src/index.js';
</script>
```

## Usage

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>onEvents Example</title>
</head>
<body>
    <button on-click="handleClick">Click me</button>

    <form on-submit="handleSubmit">
      <input type="text" />
      <button type="submit">Submit</button>
    </form>

    <div on-mouseover="handleMouseOver" class="card">
      Hover over me
    </div>

    <script type="module">
        import onEvents from 'https://cdn.jsdelivr.net/gh/lessmatter/onevents@main/src/index.js';
        
        function handleClick(params) {
            console.log('Button clicked!', params.event, params.element);
        }
        
        function handleSubmit(params) {
            params.event.preventDefault();
            console.log('Form submitted!');
        }
        
        function handleMouseOver(params) {
            params.element.style.backgroundColor = 'lightblue';
        }
        
        const destroyEvents = onEvents({ 
            actions: { handleClick, handleSubmit, handleMouseOver }
        });
        
        // Later, to remove all event listeners:
        // destroyEvents();
    </script>
</body>
</html>
```

### 2. Dynamic Content (Advanced)

If you have elements that are added to the DOM dynamically (after the initial page load), you can preload event types:

```javascript
// Preload events for dynamic content
const destroyEvents = onEvents({ 
  actions: { handleClick, handleSubmit, handleMouseOver },
  preloadEvents: ['click', 'submit', 'mouseover'] 
});

// Later, when new elements are added:
document.body.innerHTML += '<button on-click="handleClick">Dynamic Button</button>';
// This button will work immediately without needing to reinitialize onEvents
```

### 3. Scoped Events (Advanced)

You can limit event listening to a specific container element:

```javascript
// Get a specific container
const sidebar = document.querySelector('.sidebar');

// Initialize events only for the sidebar
const destroySidebarEvents = onEvents({ 
  actions: { handleClick, handleMouseOver },
  root: sidebar
});

// Only elements inside .sidebar will trigger events
// <div class="sidebar">
//   <button on-click="handleClick">Sidebar Button</button>
// </div>
```

## API

### onEvents(options): () => void

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
- Mouse events: `click`, `dblclick`, `mousedown`, `mouseup`, `mouseover`, `mouseleave`, etc.
- Form events: `submit`, `input`, `change`, `focus`, `blur`, `reset`, `invalid`
- Keyboard events: `keydown`, `keyup`, `keypress`
- Touch events: `touchstart`, `touchend`, `touchmove`
- And many more...

## Notes

- Mouse enter/leave: `on-mouseenter` and `on-mouseleave` are supported. Under the hood they are mapped to `mouseover`/`mouseout` and filtered using `relatedTarget` to emulate native semantics (no firing when moving between descendants).
- Some events do not delegate reliably from a container and are skipped: `scroll`, `resize`, `load`, `beforeunload`, `error`, `abort`, `DOMContentLoaded`.
- Focus handling: you can use either `on-focus`/`on-blur` (internally mapped to `focusin`/`focusout`) or directly `on-focusin`/`on-focusout`. Both work with delegation.

## License

MIT 