# Harrison's Sweet Potato Kitchen 🍠

Four gentle, Toca-style games in one little site. The title screen is the hub: the big play button opens the kitchen, and the tiles underneath open the train, the monster band and the goldfish snacks.

A gentle, Toca-Kitchen-style cooking playground about one very important ingredient: **sweet potatoes**.

There are no rules, timers, scores or wrong answers. Every tap makes something fun happen.

## How to play

0. **Tap the big green play button** on the title screen.
1. **Tap the fridge** to get a sweet potato.
2. **Tap a tool** (or drag the potato onto it):
   - 🔪 knife: whole → halves → slices → fries → cubes
   - masher: turns anything into a bowl of mash
   - pot: boil · pan: fry · oven: bake · microwave: zap
   - Tools can be combined in any order (chop, then fry, then bake...).
3. **Tap a topping**: butter, cinnamon, marshmallows, honey, cheese, sprinkles. Tap again for more.
4. **Tap the hungry friend** (or drag the food to their mouth). Three bites and it's gone, with a happy reaction.
5. Every new kind of dish you feed them earns a **sticker** on the shelf at the top.

Four friends to feed: Harrison (the game's biggest sweet potato fan, in his navy golf shirt), Pip, Momo the monster, and Tater the sweet potato. Tap a face at the top to switch.

**Texas Roadhouse mode:** bake a whole potato, add marshmallows, then bake it again. The marshmallows melt into a golden toasted blanket, with a couple of spares on the side of the plate.
The speaker button turns sound on and off. All sounds are generated in the browser, so there are no audio files to download.

The game remembers the chosen friend, sound setting and stickers on each device.

## Harrison's Train 🚂 (`/train/`)

Drive a train through a meadow, a forest, a desert, snowy mountains (with a tunnel), a beach with a bridge over the sea, and a city at night. The landscapes loop forever.

- **Lever** on the right: drag up to go faster, all the way down to stop. Tapping the right half of the scene also speeds up, the left half slows down.
- **Whistle** and **bell** buttons.
- Every landscape has a **station**. Pull the lever down as you approach and the train glides to the platform on its own. Waiting passengers hop aboard one by one, cargo loads onto the freight car, and the signal turns green. Harrison drives; Pip, Momo and Tater turn up as passengers.
- Landscape (phone sideways) gives the best view, portrait works too.

## Harrison's Monster Band 🎶 (`/music/`)

Eight monsters, each with an instrument and its own loop. Everything is written in one key, so any mix sounds good.

- **Tap a monster card** at the bottom and it hops onto the stage and starts playing in time with the others. Tap the card again to send it off.
- **Tap a monster on stage** for a little solo.
- **Star button** fills the stage. **Tortoise / walker / rabbit** set the tempo.
- Five or more monsters on stage brings confetti.

Boom (drums), Rumble (bass), Twinkle (bells), Fuzz (keys), Pluck (ukulele), Shaky (maracas), Lulu (singer) and Honk (trumpet).

## Harrison's Goldfish Snacks 🐟 (`/fish/`)

Eight bags of fish-shaped crackers: Cheddar, Pretzel, Pizza, Colors, Parmesan, Xtra Cheddar, Cupcake and S'mores.

- **Tap a bag** and it flies over the bowl, tips and pours a handful of crackers in. Mix flavors as much as you like.
- **Tap the friend** to feed them a handful from the top of the pile, or **drag a single cracker** to their mouth.
- **Tap the bowl** to shake it. Tap a cracker to make it hop.
- Every tenth cracker brings a big happy moment with hearts.

Same four friends as the kitchen: Harrison, Pip, Momo and Tater.

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
  train/index.html    the train game (self-contained)
  music/index.html    the monster band (self-contained)
  fish/index.html     the goldfish snacks (self-contained)
  index.html          kitchen page structure and the title screen / hub
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
