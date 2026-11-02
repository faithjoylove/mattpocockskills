import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext(null);

// The signed-in Shopper's Favourites, most recently saved first. The list is
// tied to the email it was loaded for, so signing out (or in as someone else)
// never shows another Shopper's Favourites.
export function FavouritesProvider({ children }) {
  const { email, isAuthenticated } = useAuth();
  const [loaded, setLoaded] = useState({ email: null, favourites: [], error: '' });
  const [actionError, setActionError] = useState('');
  const inFlight = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let ignore = false;
    api
      .getFavourites()
      .then((favourites) => {
        if (!ignore) setLoaded({ email, favourites, error: '' });
      })
      .catch((err) => {
        if (!ignore) setLoaded({ email, favourites: [], error: err.message });
      });
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, email]);

  const current = isAuthenticated && loaded.email === email ? loaded : null;
  const loading = isAuthenticated && !current;
  const favourites = useMemo(() => current?.favourites ?? [], [current]);
  const error = current?.error ?? '';
  const favouriteIds = useMemo(
    () => new Set(favourites.map((favourite) => favourite.id)),
    [favourites],
  );

  // Always the latest list, so a click never acts on a stale render.
  const latest = useRef({ favourites, loading });
  latest.current = { favourites, loading };

  const changeList = useCallback(
    (change) =>
      setLoaded((previous) =>
        previous.email === email
          ? { ...previous, favourites: change(previous.favourites) }
          : previous,
      ),
    [email],
  );

  // Updates the list straight away and puts it back if the server refuses.
  const optimistically = useCallback(
    async (productId, change, request, undo) => {
      changeList(change);
      try {
        await request(productId);
      } catch (err) {
        changeList(undo);
        throw err;
      }
    },
    [changeList],
  );

  const toggleFavourite = useCallback(
    async (product) => {
      const { favourites: list, loading: stillLoading } = latest.current;
      // Ignore clicks before the list is known, and repeat clicks while this
      // Product's request is still running.
      if (stillLoading || inFlight.current.has(product.id)) return;

      const index = list.findIndex((favourite) => favourite.id === product.id);
      const without = (items) => items.filter((favourite) => favourite.id !== product.id);

      inFlight.current.add(product.id);
      setActionError('');
      try {
        if (index >= 0) {
          await optimistically(
            product.id,
            without,
            api.removeFavourite,
            (items) => [...items.slice(0, index), product, ...items.slice(index)],
          );
        } else {
          await optimistically(
            product.id,
            (items) => [product, ...items],
            api.saveFavourite,
            without,
          );
        }
      } catch (err) {
        setActionError(err.message);
      } finally {
        inFlight.current.delete(product.id);
      }
    },
    [optimistically],
  );

  const value = useMemo(
    () => ({
      favourites,
      favouriteIds,
      loading,
      error,
      actionError,
      toggleFavourite,
    }),
    [favourites, favouriteIds, loading, error, actionError, toggleFavourite],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within FavouritesProvider');
  }
  return context;
}
