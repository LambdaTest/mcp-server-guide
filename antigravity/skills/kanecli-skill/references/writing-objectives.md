# Writing objectives

> Moved here from SKILL.md so the main skill file stays within the size Antigravity loads. Content unchanged.

How you phrase the objective string determines what the agent does. Four patterns:

> For the full catalog — every action verb, every assertion analyze method (Visual / Textual-DOM / URL / Title / DevTools→Network/Console/Performance/Cookies/localStorage/Clipboard), direct API calls, operators, chaining, conditional/negative patterns, and worked examples — Read `references/objectives-cookbook.md`. Same grammar applies to one-shot `kane-cli run` objectives and `_test.md` step bodies.

| Pattern | Trigger words | Behavior |
|---|---|---|
| 🎯 **Action** | "go to", "click", "type", "search", "fill" | Performs browser actions |
| ✅ **Assertion** | "assert", "verify", "confirm", "check that" | Pass/fail check on a condition |
| 📦 **Extraction** | "store X as 'name'" | Persists a value into `run_end.final_state` |
| 🔌 **API call** | "call", "POST/GET a URL", a pasted `curl` | The agent makes the HTTP request itself; "save the response as X", then assert on it in plain English: "assert the response status is 200", "store the id from the response body as 'order_id'" |

### Two rules that make an objective replayable

1. **End every flow in a terminal assertion.** Close with a check of the resulting page state (`verify the cart shows 1 item`), not a bare `submit` or `confirm the dialog`. A run only earns a replayable pass/fail from a verify/assert — a pure-action objective (`add a laptop to the cart`) gets none. If the objective has several phases, each ends in its own check. Phrase the closing check as what is on screen once the last action completes, so it verifies with no further click or navigation; if the evidence is elsewhere, make getting there an explicit action (`place the order, open Order History, then verify the newest order shows "Processing"`), never `verify the order succeeded by checking Order History`. Two traps: `confirm the dialog` is an action, not a check; and `verify the Submit button is visible` fails exactly when the action worked (the control disappears on success) — assert the outcome, not the trigger.
2. **Intent for the actions, literal for the data.** Phrase actions as goals (`Log in with {{user}}`) so the run absorbs layout drift; keep exact values literal or in `{{variables}}`. An expected-optional branch (a sometimes-there cookie banner) goes in an `if/else`, not assumed away.

**Shape:** an intent action carrying literal data, then a verify of an observable end state — `Search for "{{query}}" and open the first result, then verify the title contains "{{query}}"`. Full grammar in `references/objectives-cookbook.md §1`.

### The "store as" rule (critical for extraction)

Vague phrasing like "read", "tell me", "report" does NOT reliably extract data — the agent may see the value but won't capture it. Use "store as".

❌ `"go to example.com and read the page title"`
✅ `"go to example.com, store the page title as 'page_title'"`

Stored values appear in `run_end.final_state` and become the second results table per §1.4. Refer back to a stored value in plain English (`the stored price value`), never as `{{price}}`; `{{name}}` is for global variables and secrets only.

### Calling APIs directly

The agent can make API calls itself — not just observe the page's traffic. Phrase an explicit call and name the response:

```text
"Call POST https://api.example.com/login with body {...}, save the response as login,
 assert the response status is 200"
```

Use the response in plain English: `the response status`, `store the id from the response body as 'order_id'`, and later `the stored order_id value`. Never `{{login.status}}`: `{{name}}` is reserved for global variables and secrets. A pasted `curl` works too. Full grammar in `references/objectives-cookbook.md` §3.5.

### Chaining

Action → extraction → assertion in one objective:

```text
"go to {{app_url}}/dashboard,
 store the welcome message as 'welcome_text',
 assert the user role in the sidebar is 'Admin'"
```

### Dos and don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Imperative verbs: "go to", "click", "store as" | Vague verbs: "check out", "look at", "explore" |
| Specific: "click the 'Add to Cart' button" | Vague: "add the item" |
| Name extractions: "store X as 'price'" | Hope for values: "tell me the price" |
| `{{variables}}` for credentials/URLs | Hardcode secrets in the objective |
| Plain English for values the run produces: "the stored price value", "the response status" | `{{price}}` / `{{login.status}}` for a stored value or an API response |
| Always include starting URL | Assume the agent knows where to start |
| Split mega-objectives (>15 steps) into multiple runs | Cram everything into one |
