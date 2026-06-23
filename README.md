# BotiCart Terms — Frontend

Simple static frontend for the BotiCart Terms & Conditions.

How to use

- Open `index.html` in a browser (double-click or serve with a static server).
- Click "Print / Save PDF" to save as PDF via the browser print dialog.

Account deletion endpoint

- Install dependencies with `npm install`.
- Copy `.env.example` to `.env` and set the SMTP values for your mail provider if you want SMTP delivery.
- Start the server with `npm start`.
- Open `http://localhost:3000/account-deletion.html` and submit the form.
- The request is sent to `boticart.management@gmail.com` through SMTP when configured, or through the local `sendmail` binary as a fallback.

Files

- `index.html` — main document
- `styles.css` — styling and print rules
- `script.js` — smooth scroll and print trigger
- `server.js` — account deletion API and static file server
