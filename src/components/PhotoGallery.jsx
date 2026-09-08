import { useEffect, useState } from 'react';
import { getPhotos } from '../lib/photoStore';

export default function PhotoGallery({ placeId, refreshKey }) {
  const [photos, setPhotos] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPhotos(placeId)
      .then((p) => { if (!cancelled) setPhotos(p); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [placeId, refreshKey]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="photo-strip">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="photo-thumb"
            onClick={() => setOpenIndex(i)}
            aria-label={`View photo ${i + 1}`}
          >
            <img src={p.dataUrl} alt="" />
          </button>
        ))}
      </div>

      {openIndex != null && (
        <div className="lightbox-backdrop" onClick={() => setOpenIndex(null)}>
          <img src={photos[openIndex].dataUrl} alt="" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          <button className="lightbox-close" onClick={() => setOpenIndex(null)} aria-label="Close">×</button>
          {photos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i - 1 + photos.length) % photos.length); }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i + 1) % photos.length); }}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
