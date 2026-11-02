import { useFavourites } from '../context/FavouritesContext';

// Favourite problems are shown here, outside any product card, so a message is
// never lost when the card it came from disappears.
export default function FavouritesNotice() {
  const { error, actionError } = useFavourites();
  const message = error ? `Could not load your favourites: ${error}` : actionError;
  if (!message) return null;

  return (
    <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  );
}
