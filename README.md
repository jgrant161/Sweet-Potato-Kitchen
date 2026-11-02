# Sweet Potato Kitchen 🍠

A gentle, Toca-Kitchen-style cooking playground about one very important ingredient: **sweet potatoes**.

There are no rules, timers, scores or wrong answers. Every tap makes something fun happen.

## How to play

1. **Tap the fridge** to get a sweet potato.
2. **Tap a tool** (or drag the potato onto it):
   - 🔪 knife: whole → halves → slices → fries → cubes
   - masher: turns anything into a bowl of mash
   - pot: boil · pan: fry · oven: bake · microwave: zap
   - Tools can be combined in any order (chop, then fry, then bake...).
3. **Tap a topping**: butter, cinnamon, marshmallows, honey, cheese, sprinkles. Tap again for more.
4. **Tap the hungry friend** (or drag the food to their mouth). Three bites and it's gone, with a happy reaction.
5. Every new kind of dish you feed them earns a **sticker** on the shelf at the top.

Three friends to feed: Pip, Momo the monster, and Tater the sweet potato. Tap a face at the top to switch.
The speaker button turns sound on and off. All sounds are generated in the browser, so there are no audio files to download.

The game remembers the chosen friend, sound setting and stickers on each device.

## Running it locally

```bash
npm start          # http://localhost:3000
```

No dependencies and no build step. Everything the browser needs is in `public/`.

## Deploying to Render

The repo includes a `render.yaml`, so Render can set everything up as a free **static site**:

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, pick the repository, and click **Apply**.
3. Render gives you a URL like `https://sweet-potato-kitchen.onrender.com`. Open it on any phone or tablet.

If you would rather create the service by hand: **New → Static Site**, build command left empty, publish directory `public`.
It also runs as a Node **Web Service** (`npm start`) if you ever add a backend.

### Putting it on the home screen

Open the Render URL in the phone's browser and use **Add to Home Screen** (iPhone: Share → Add to Home Screen; Android: menu → Install app).
It then opens full screen like a native app, and keeps working offline after the first visit.

## Project layout

```
public/
  index.html          page structure
  style.css           layout, colors, animations
  game.js             game logic, characters, food art (inline SVG), synthesized sounds
  sw.js               offline cache
  manifest.webmanifest, icon.svg, icon-192.png, icon-512.png
server.js             tiny static server (used by `npm start`)
render.yaml           Render blueprint (static site)
```

## Ideas for later

- More ingredients or a second plate
- Recording a parent's voice for the "yum!" reactions
- A photo button that saves a picture of the finished dish
