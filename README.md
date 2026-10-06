# Shopping_app

A shopping list web app for ticking things off as you shop. It matches the look of Wealth Tracker and works the same way: one `index.html`, no build step, installable on your phone's home screen, and works offline in the shop. Everything is stored on the phone, and you can choose to share it between phones (yours and your partner's) through your Netlify site.

## Features

- **Lists**: as many lists as you like (Big shop, Aldi, Party…). Tap an item to tick it into the basket, or **Tick all** for the whole list or one aisle at a time, with a progress bar.
- **Cost estimates**: every list shows a rough total, and each item a rough price, from built-in typical UK supermarket prices (pack sizes included, so 3 tbsp of soy sauce costs a bottle). Recipes and planned meals show what they cost to buy and roughly what they cost a serving. Pick Budget, Standard or Premium prices in Settings, or turn estimates off. A price you type in for an item always wins.
- **Smart adding**: type `2 x milk`, `400g mince` or `apples, bread, eggs` and quantities are pulled out. Adding the same item twice merges it (carrot + carrots → one line, with quantities added up).
- **Item history**: everything you've added before pops up as you type, with "Often bought" suggestions when the box is empty. The aisle, usual quantity and price are remembered.
- **Aisles**: items are sorted into Fruit & veg, Bakery, Meat & fish, Dairy, Cupboard, Frozen and so on. You can also group the list by source (which container or recipe an item came from) or A–Z.
- **Containers**: reusable groups of items, e.g. **Parrot food** with all the fruit and veg it needs. Add the whole container to a list, or tick just the bits you need this week. You can also save any list as a container.
- **Meal plan**: plan recipes onto days of the week from the recipe sheet ("Meal plan" picker) or from the **Meals** tab. Planning adds the ingredients to your list and puts the meal on that day. Each planned meal has a **change** (⇄) and **remove** (×) button: removing or swapping a meal can take its ingredients back off your list (only what's still to get, and quantities other meals need are kept). Tap a planned meal to see its ingredients (scaled to the servings you planned) and the method while you cook, mark it cooked, move it to another day, or jot down non-recipe meals like "Leftovers".
- **Ideas for your next meal**: once a meal is planned, the Meals tab spots fresh things it'll leave over (half a pot of cream, the rest of a bunch of spring onions) and suggests your recipes that use them up, or share ingredients you're already buying, along with what else they'd cost. If none of your recipes fit, it writes a Claude prompt for a recipe that uses up the leftovers.
- **Recipes from Claude**: import `.md` recipe files (button, drag and drop, or paste). Scale the servings, untick what you already have (cupboard staples start unticked), and add the rest to your list. The **Claude prompt** button copies a ready-made request that makes Claude reply in the right format.
- **Recipe library**: 176 ready-made recipes come with the app: chicken, beef, pork, lamb, fish and vegetarian, from quick breakfasts and lunches, cheap and easy family meals, weeknight dinners and fakeaways to pies, soups, moussaka and a Sunday roast. Tap **Recipe library** on the Recipes page and tick the ones you want.
- **Recipe filters**: filter your recipes by what's in them (**Chicken**, **Beef**, **Pork**, **Lamb**, **Fish & seafood**, **Vegetarian**), worked out from the ingredients, and by their tags (**Dinner**, **Quick**, **Comfort food**…), so it's easy to mix up the week. Use the chips at the top, or tap a tag on any recipe card (or inside a recipe) to filter by it, and tap more to narrow it down.
  - Picking several groups shows any of them, e.g. Chicken + Vegetarian.
  - Picking several tags shows recipes with all of them, e.g. Quick + Comfort food. Switch to **Any of them** to widen it instead.
  - Groups and tags combine, so Vegetarian + Quick shows quick vegetarian recipes.
  - **Budget** picks out recipes that come to about £1.50 a serving or less, worked out from the cost estimates (so it works for your own recipes too, and follows the Budget/Standard/Premium setting).
- **Finish shop**: saves the ticked items to History and clears them. Anything you didn't get comes off the list too (it's noted on that shop in History, ready to add again), or you can choose to keep it for next time or move it to another list.
- **History**: past shops (with "add these again"), most-bought items, and a searchable "Buy again" list.
- **Share between phones**: Settings → *Start sharing* gives you a household code and an invite link. Any phone that joins sees the same lists, containers, recipes and history, and ticks show up on the other phone within a few seconds. Each phone keeps its own theme and open list.
- **Keep screen on** while shopping (on phones that support it), share a list as text, undo on deletes, light/dark theme, and backup/restore to a file.

## Recipe format

See [docs/recipe-format.md](docs/recipe-format.md). There's an example in [public/recipes/chicken-stir-fry.md](public/recipes/chicken-stir-fry.md).

The recipe library is the `.md` files in [public/recipes/](public/recipes/). To add one, put the file there and add its name to [public/recipes/index.json](public/recipes/index.json).

## Putting it on a phone

There's no app store download: it's a web app you add to your home screen.

- **iPhone**: open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Android**: open the site in Chrome, tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

To share lists, tap **Settings → Start sharing** on the first phone, then **Send invite** to the other person. On iPhone the home screen app keeps its own storage, separate from Safari. So on the second iPhone, add the app to the home screen first, open it from there, and use **Settings → Join with a code**.

## How sharing works

Each phone keeps working from its own copy, offline included. When something changes, it's sent to `/api/sync` ([netlify/functions/sync.mts](netlify/functions/sync.mts)), which keeps one copy per household in [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). Phones check for each other's changes every few seconds while the app is open.

- A save only goes through if it was made on top of the latest copy. Otherwise the phone gets the latest copy back, merges the two and tries again. Lists, items, containers, recipes and past shops are matched by id, so two people adding, ticking and removing different things at the same time all survives. If both change the very same thing, the last phone to save wins.
- The household code is the password: anyone with it can read and change that household's lists. It's 16 random characters, and the server stores the data under a hash of the code rather than the code itself.
- Deploy previews and `netlify dev` use their own store, so testing never touches the real lists.

## Running it

The app is `public/index.html`. Open it in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000 -d public
```

Sharing needs the Netlify Function too, so to try that locally use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```sh
npm install
npx netlify dev
```

## Deployment

Hosted on [Netlify](https://www.netlify.com/). `netlify.toml` publishes `public/` with no build command, and Netlify picks up the sync function from `netlify/functions/`. Netlify Blobs needs no setup.
