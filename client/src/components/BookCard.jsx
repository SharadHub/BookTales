import { useState } from 'react';

function BookCard({ book, onClick }) {
  if (!book) return null;
  const hasRating = book.averageRating && book.averageRating > 0;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSrc = imageError ? '/placeholder-book.jpg' : book.coverImageUrl || '/placeholder-book.jpg';

  return (
    <article
      className="book-card rounded-3xl bg-white p-3 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:focus"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${book.title} by ${book.author}, ${book.category}${book.genre ? ` - ${book.genre}` : ''}${hasRating ? `, ${book.averageRating} stars` : ', No rating'}`}
    >
      <div className="aspect-[9/12] overflow-hidden rounded-3xl bg-slate-100 relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
        )}
        <img
          src={imageSrc}
          alt={`${book.title} cover`}
          className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ imageRendering: 'auto' }}
        />
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 flex-1 leading-tight line-clamp-2">
          {book.title}
        </h2>
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-amber-700 text-[11px] font-semibold uppercase tracking-[0.18em]" aria-label={`Rating: ${hasRating ? `${book.averageRating} out of 5 stars` : 'No rating available'}`}>
          {hasRating ? `${book.averageRating}★` : 'No rating'}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600 truncate">
        By {book.author} · {book.category}
        {book.genre && ` · ${book.genre}`}
      </p>
    </article>
  );
}

export default BookCard;
