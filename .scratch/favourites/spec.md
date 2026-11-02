Status: ready-for-agent

# Favourites

## Problem Statement

A Shopper browsing the store has no way to remember Products they like. To find one again they have to search the catalog, or put it in the basket and risk buying it. Signed-in Shoppers want a lasting shortlist.

## Solution

A signed-in Shopper can mark any Product as a Favourite with a heart toggle on the catalog's product cards. They can see all their Favourites on a dedicated Favourites page, remove them there, and add them to the basket from there. Signed-out Shoppers are asked to sign in instead.

## User Stories

1. As a signed-in Shopper, I want to heart a Product on the catalog, so that I can find it again later
2. As a signed-in Shopper, I want to un-heart a Product on the catalog, so that my shortlist only holds things I still care about
3. As a signed-in Shopper, I want hearted Products to show a filled heart whenever I browse, so that I can tell what I've already saved
4. As a signed-in Shopper, I want a Favourites page listing all my Favourites, so that I can review them in one place
5. As a signed-in Shopper, I want the most recently saved Favourite first, so that what I just saved is easy to find
6. As a signed-in Shopper, I want each Favourite to show its current name, price and picture, so that I see up-to-date information
7. As a signed-in Shopper, I want to un-heart a Product on the Favourites page and see its card disappear, so that I can tidy the list quickly
8. As a signed-in Shopper, I want an Add to basket button on each Favourite, so that I can buy it without searching again
9. As a signed-in Shopper, I want adding a Favourite to the basket to leave it in my Favourites, so that I keep my shortlist after buying
10. As a signed-in Shopper, I want my Favourites to still be there after I sign out and back in, or use another device, so that the shortlist is reliable
11. As a signed-in Shopper, I want saving an already-saved Product to do nothing harmful, so that a double click or retry never causes an error or duplicate
12. As a signed-in Shopper, I want removing a Product that isn't a Favourite to do nothing harmful, so that stale pages don't show errors
13. As a signed-in Shopper, I want an empty Favourites page to say I have no Favourites yet, so that I know the page is working
14. As a signed-in Shopper, I want a Favourites link in the header, so that I can reach the page from anywhere
15. As a signed-out Shopper, I want the heart to take me to sign-in, so that I understand I need an account to save Products
16. As a signed-out Shopper, I want the Favourites link hidden from the header, so that I'm not offered a feature I can't use
17. As a signed-out Shopper, I want opening the Favourites page directly to redirect me to sign-in, so that I don't see a broken page
18. As a Shopper, I want my Favourites kept private, so that no other Shopper can see or change them
19. As a Shopper, I want my Favourites to be separate from any anonymous basket, so that nobody can reach them by guessing a basket id
20. As a Shopper, I want trying to favourite a Product that doesn't exist to fail clearly, so that I'm never left with a broken entry
21. As a developer, I want Favourites to follow the existing layering and identity conventions, so that the feature stays small and reviewable

## Implementation Decisions

- **Glossary**: use the terms in `GLOSSARY.md` (Product, Shopper, Favourite). Code and UI copy say "Product" and "Favourite" and avoid "wishlist" and "catalog item".
- **Schema**: a new favourites table with:
  - the Shopper's lowercased email, the same identity used for signed-in baskets;
  - the Product id, a foreign key to the catalog items;
  - a timezone-aware UTC creation time;
  - a unique constraint on email plus Product, so a Product can be a Favourite only once per Shopper.
- **Identity**: Favourites use only the authenticated email, via the existing `require_authenticated_user` dependency. They must never accept the anonymous basket id. A request with only an `X-Basket-Id` is a 401.
- **API**, a new router with a thin service and SQL in the DB client:
  - `GET /api/favourites` returns the Shopper's Favourites, most recently saved first. Each entry carries the Product's current id, name, price and picture, with no paging and no cap. An empty list is a normal response.
  - `PUT /api/favourites/{product_id}` saves a Favourite. It is idempotent: a repeat is a success with no duplicate and no change to the original creation time. An unknown Product returns 404.
  - `DELETE /api/favourites/{product_id}` removes a Favourite. It is idempotent: removing a Product that isn't a Favourite succeeds.
  - Missing or invalid credentials return 401, consistent with the rest of the API.
  - The catalog endpoints are unchanged. They gain no `is_favourite` flag.
- **Frontend**:
  - When a Shopper is signed in, the app fetches their Favourites once and keeps the set of Favourite Product ids in client state. Hearts read from it and update optimistically, then roll back on failure.
  - A heart toggle appears on every product card and on each Favourites page card.
  - Signed-out hearts route to sign-in.
  - A Favourites route and Header link are shown only when signed in, and the route redirects signed-out visitors to sign-in.
  - The Favourites page shows the empty state from user story 13.
  - Each Favourites card has an Add to basket button that uses the existing basket flow.
  - Signing out clears the client's Favourite state.
  - API calls go through the existing API client module.

## Testing Decisions

- **One seam: the HTTP API.** Tests call `/api/favourites` through the existing `client` fixture, which runs the API against a throwaway database. They assert only on external behaviour (status codes and response bodies), never on service or SQL internals.
- A good test reads like a Shopper story: sign in, save, list, remove, check the result.
- **Backend tests to add**:
  - save then list shows the Product with current details;
  - a repeat save creates no duplicate;
  - removal works, and removing a non-Favourite succeeds;
  - an unknown Product returns 404;
  - ordering is most recently saved first;
  - an empty list is returned for a new Shopper;
  - signed-out requests get 401, including with only a valid anonymous `X-Basket-Id`;
  - an email or malformed value as `X-Basket-Id` can't reach Favourites;
  - two Shoppers' Favourites stay isolated, using a second user created through the existing auth endpoints;
  - Favourites survive a fresh login.
- **Prior art**: `test_basket_identity.py` for identity isolation and the `login`, `demo_headers` and `anon_headers` helpers in `conftest.py`. `test_order_timestamps.py` for timezone-aware UTC time assertions.
- **No frontend tests.** The repo has no frontend test setup. The UI is verified manually and its behaviour is covered by the story list above.
- Per `AGENTS.md`, paste the `uv run pytest` output as evidence before saying it works.

## Out of Scope

- Anonymous Favourites, and merging anything on sign-in.
- Paging, limits or search within Favourites.
- Sharing Favourites, public lists, multiple named lists, notes on a Favourite.
- Price-drop or stock notifications.
- An `is_favourite` flag on catalog responses, and Favourite counts per Product.
- Cleanup when a Product is removed from the catalog (there is no admin area).
- Frontend test infrastructure.

## Further Notes

- The anonymous-versus-signed-in rule in `AGENTS.md` ("never let one address the other") applies directly. Favourites sit entirely on the signed-in side.
- Keep the change small enough to review in one sitting, per the `AGENTS.md` non-goals.

## Comments
