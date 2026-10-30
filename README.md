# Tallinn road trip deck

A responsive, dependency-free page for a trip with friends. Flip challenge cards, mark them done, filter your deck, or add your own tasks. The interface is in Latvian and includes the supplied “Fināla uzvaras poza” task for Elīza, Raimonds, Laura, and Reinis.

## Run

Requires Node.js 20 or newer. No package installation or credentials required.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Run `npm run check` for JavaScript syntax checks. The page can also be hosted by any static web host using `index.html`, `style.css`, and `app.js`.

Progress and custom tasks are saved in the browser's local storage. They are specific to that browser and website address; there is no shared group synchronization. Clearing browser data removes saved changes. The app remains functional with fallback system fonts when Google Fonts cannot load. Use the page only as a passenger or while safely parked.
