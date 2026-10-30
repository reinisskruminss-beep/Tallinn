# Tallinn road trip deck

A responsive, dependency-free Latvian photo challenge page for a trip with friends. Includes 30 one-sided task cards across nine categories from the supplied trip list, with photographer, participants, and flash instructions. Filter by category or completion, mark cards done with a prominent button, and undo completion. Completed cards have a gray overlay. The previous example task is replaced; existing custom cards are retained when migrating browser storage.

## Run

Requires Node.js 20 or newer. No package installation or credentials required.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Run `npm run check` for JavaScript syntax checks. The page can also be hosted by any static web host using `index.html`, `style.css`, `app.js`, and `tasks.js`.

Progress and custom tasks are saved in the browser's local storage. They are specific to that browser and website address; there is no shared group synchronization. Clearing browser data removes saved changes. The app remains functional with fallback system fonts when Google Fonts cannot load. Use the page only as a passenger or while safely parked.
