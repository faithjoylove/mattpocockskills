import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';

export default function FavouriteButton({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { favouriteIds, loading, toggleFavourite } = useFavourites();
  const isFavourite = favouriteIds.has(product.id);

  function handleClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    toggleFavourite(product);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isFavourite}
      aria-label={`Favourite ${product.name}`}
      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${isFavourite ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-slate-600'}`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
