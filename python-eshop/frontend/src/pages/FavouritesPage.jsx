import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';

export default function FavouritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favourites, loading, error } = useFavourites();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favourites' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  if (loading) {
    return <p className="text-center text-slate-500">Loading favourites...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My favourites</h1>
        <p className="mt-1 text-slate-500">Products you have saved for later.</p>
      </div>

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
