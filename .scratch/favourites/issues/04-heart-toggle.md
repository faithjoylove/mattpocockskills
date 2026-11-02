# 04: Heart toggle

**What to build:** A heart toggle on every product card and every Favourites card lets a signed-in Shopper save and un-save Products, with the filled state visible while browsing. A signed-out Shopper who clicks a heart is sent to sign-in. Part of `.scratch/favourites/spec.md`.

**Blocked by:** 02: Remove a Favourite; 03: Favourites page

**Status:** ready-for-agent

- [ ] After sign-in the app loads the Shopper's Favourites once and keeps the set of Favourite Product ids; signing out clears it
- [ ] Hearts on product cards show filled for Favourites and toggle on click
- [ ] Toggling updates immediately and rolls back if the request fails
- [ ] Un-hearting on the Favourites page removes that card
- [ ] A signed-out Shopper clicking a heart is sent to sign-in
- [ ] The catalog endpoints are unchanged
- [ ] Verified manually in the running app; evidence noted in the ticket

## Comments
