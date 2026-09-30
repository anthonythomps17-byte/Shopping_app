# Recipe file format

The app imports recipes as Markdown (`.md`) files. The easiest way to get one is to tap **Claude prompt** on the Recipes page, paste the prompt into Claude, and swap `[DISH]` for what you want to cook.

## Layout

```markdown
# Recipe name
Serves: 4
Time: 30 min
Tags: dinner, quick

One or two sentences about the dish.

## Ingredients
- 400g chicken breast, sliced
- 2 tbsp soy sauce
- 1 red pepper

### For the sauce
- 1 tbsp honey

## Method
1. First step.
2. Second step.

## Notes
- Tips, swaps or storage.
```

## How it's read

| Part | What the app does with it |
| --- | --- |
| `# Heading` | The recipe name. If it's missing, the file name is used. |
| `Serves:` | Sets the starting servings for the scaler. `Makes:` also works. |
| `Time:`, `Prep time:`, `Cook time:` | Shown under the title. |
| `Tags:` | Comma-separated labels, searchable. |
| `## Ingredients` | Each bullet becomes an ingredient. Headings like "What you'll need" or "Shopping list" also work. |
| `### Sub-heading` | Groups ingredients (e.g. "For the sauce"). |
| `## Method` | Numbered or bulleted steps. "Steps", "Instructions" and "Directions" also work. |
| Anything else | Shown as notes. |

## Ingredient lines

Write the quantity first, then the ingredient, then any preparation after a comma:

- `400g chicken breast, sliced` → **Chicken breast**, 400g, note "sliced"
- `2 cloves garlic, crushed` → **Garlic**, 2 cloves
- `1½ tbsp honey` → **Honey**, 1½ tbsp
- `Salt and pepper, to taste` → starts unticked

Numbers (`2`, `1.5`, `1/2`, `1 1/2`, `½`) are scaled when you change the servings. Anything in brackets becomes a note. Items listed under **Cupboard staples** in Settings, or marked "optional" or "to taste", start unticked so they don't end up on your list.
