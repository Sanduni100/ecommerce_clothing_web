'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Star, ShoppingBag, Minus, Plus, Heart } from 'lucide-react';
import api from '../../../lib/api';
import { getImageUrl } from '../../../lib/getImageUrl';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCurrency } from '../../../context/CurrencyContext';

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useWishlist();
  const { format } = useCurrency();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const load = () => {
    api.get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.product);
        setReviews(res.data.reviews);
        setImages(res.data.product.images?.length ? res.data.product.images : [null]);
        setActiveImage(0);
      })
      .catch(() => toast.error('Product not found'));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16">Loading product...</div>;

  const mainImage = getImageUrl(images[activeImage], 'https://placehold.co/600x750/EDE0F5/7B68B0?text=coop+shop');
  const favourited = isFavourite(product.id);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please log in to leave a review');
    try {
      await api.post(`/products/${product.id}/reviews`, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted successfully');
      setReviewText('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-blush dark:bg-gray-800">
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === i ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={getImageUrl(img)} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary font-medium">{product.category_name}</p>
              <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
            </div>
            <button onClick={() => toggleFavourite(product)} className="p-2.5 rounded-full bg-blush dark:bg-gray-800 hover:scale-110 transition-transform" aria-label="Toggle favourite">
              <Heart size={20} className={favourited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Star size={14} className="fill-secondary text-secondary" />
            {Number(product.rating || 0).toFixed(1)} ({product.num_reviews} reviews)
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-bold text-primary">{format(product.price)}</span>
            {product.compare_price && (
              <span className="text-gray-400 line-through">{format(product.compare_price)}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${size === s ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${color === c ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2"><Minus size={16} /></button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2"><Plus size={16} /></button>
            </div>
            <button
              onClick={() => addToCart(product.id, qty, size, color)}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
              disabled={product.stock === 0}
            >
              <ShoppingBag size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">{product.stock} in stock</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        <form onSubmit={submitReview} className="card p-4 mb-6 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button type="button" key={r} onClick={() => setReviewRating(r)}>
                <Star size={20} className={r <= reviewRating ? 'fill-secondary text-secondary' : 'text-gray-300'} />
              </button>
            ))}
          </div>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts..." className="input" rows={3} />
          <button className="btn-primary text-sm">Submit Review</button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet — be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.user_name}</p>
                  <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-secondary text-secondary" />)}</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
