# 02: Remove a Favourite

**What to build:** A signed-in Shopper can remove a Favourite through the API. Removal is idempotent, so removing a Product that isn't a Favourite succeeds quietly. Part of `.scratch/favourites/spec.md`.

**Blocked by:** 01: Save and list Favourites

**Status:** ready-for-agent

- [ ] Removing a Favourite makes it disappear from the list
- [ ] Removing a Product that isn't a Favourite succeeds with no error
- [ ] Signed-out requests return 401
- [ ] One Shopper cannot remove another Shopper's Favourite
- [ ] Favourites are still listed after the Shopper logs in again
- [ ] Backend tests use the `client` fixture; `uv run pytest` output is pasted as evidence

## Comments
