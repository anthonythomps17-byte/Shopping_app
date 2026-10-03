# Shopping_app

A shopping list web app for ticking things off as you shop. It matches the look of Wealth Tracker and works the same way: one `index.html`, no build step, installable on your phone's home screen, works offline in the shop, and everything is stored on the device only.

## Features

- **Lists**: as many lists as you like (Big shop, Aldi, Party…). Tap an item to tick it into the basket, with a progress bar and an estimated total if you add prices.
- **Smart adding**: type `2 x milk`, `400g mince` or `apples, bread, eggs` and quantities are pulled out. Adding the same item twice merges it (carrot + carrots → one line, with quantities added up).
- **Item history**: everything you've added before pops up as you type, with "Often bought" suggestions when the box is empty. The aisle, usual quantity and price are remembered.
- **Aisles**: items are sorted into Fruit & veg, Bakery, Meat & fish, Dairy, Cupboard, Frozen and so on. You can also group the list by source (which container or recipe an item came from) or A–Z.
- **Containers**: reusable groups of items, e.g. **Parrot food** with all the fruit and veg it needs. Add the whole container to a list, or tick just the bits you need this week. You can also save any list as a container.
- **Meal plan**: plan recipes onto days of the week from the recipe sheet ("Meal plan" picker) or from the **Meals** tab. Planning adds the ingredients to your list and puts the meal on that day. Tap a planned meal to see its ingredients (scaled to the servings you planned) and the method while you cook, mark it cooked, move it to another day, or jot down non-recipe meals like "Leftovers".
- **Recipes from Claude**: import `.md` recipe files (button, drag and drop, or paste). Scale the servings, untick what you already have (cupboard staples start unticked), and add the rest to your list. The **Claude prompt** button copies a ready-made request that makes Claude reply in the right format.
- **Finish shop**: saves the ticked items to History and clears them, leaving anything you didn't get on the list.
- **History**: past shops (with "add these again"), most-bought items, and a searchable "Buy again" list.
- **Keep screen on** while shopping (on phones that support it), share a list as text, undo on deletes, light/dark theme, and backup/restore to a file.

## Recipe format

See [docs/recipe-format.md](docs/recipe-format.md). There's an example in [recipes/chicken-stir-fry.md](recipes/chicken-stir-fry.md).

## Running it

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
```

## Deployment

Hosted on [Netlify](https://www.netlify.com/) as a static site. `netlify.toml` publishes the repo root, and there's no build command.
