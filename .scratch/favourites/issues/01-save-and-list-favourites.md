# 01: Save and list Favourites

**What to build:** A signed-in Shopper can save a Product as a Favourite and list their Favourites through the API. The list is most recently saved first and shows each Product's current name, price and picture. Part of `.scratch/favourites/spec.md`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Saving a Product and then listing returns it with current details
- [ ] Saving the same Product again succeeds with no duplicate and no change to its original creation time
- [ ] Saving an unknown Product returns 404
- [ ] The list is most recently saved first; a new Shopper gets an empty list
- [ ] Creation time is stored as timezone-aware UTC
- [ ] Signed-out requests return 401, including a request carrying only a valid anonymous `X-Basket-Id`; an email or malformed value as `X-Basket-Id` cannot reach Favourites
- [ ] Two Shoppers' Favourites are isolated from each other
- [ ] Backend tests use the `client` fixture; `uv run pytest` output is pasted as evidence

## Comments
