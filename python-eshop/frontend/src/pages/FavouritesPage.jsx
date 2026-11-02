import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function FavouritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favourites' } });
      return;
    }

    api
      .getFavourites()
      .then(setFavourites)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <p className="text-center text-slate-500">Loading favourites...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My favourites</h1>
        <p className="mt-1 text-slate-500">Products you have saved for later.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {favourites.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      )}

      {favourites.length === 0 && !error && (
        <div className="card text-center">
          <p className="text-slate-500">You have no favourites yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">
            Browse the catalog
          </Link>
        </div>
      )}
    </div>
  );
}
