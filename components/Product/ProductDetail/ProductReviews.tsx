import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { apiFetch } from '@lib/api';
import StarIcon from '../../icons/StarIcon';
import { SelectDropdown, Textarea } from '../../form-fields';
import type { Review, User } from '@/types';

// Extended Review type for app use
interface ReviewWithEmail extends Review {
  userEmail?: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewWithEmail[];
  averageRating: number;
  reviewCount: number;
  user?: User;
  onReviewsUpdate: (reviews: ReviewWithEmail[], average: number, count: number) => void;
  className?: string;
}

type ReviewForm = { rating: number; comment: string };

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  reviews,
  averageRating,
  reviewCount,
  user,
  onReviewsUpdate,
  className = '',
}) => {
  const { register, handleSubmit, reset, control } = useForm<ReviewForm>({
    defaultValues: { rating: 5, comment: '' },
  });

  const handleReviewSubmit = async (data: ReviewForm) => {
    const res = await apiFetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      const response = await res.json();
      const rres = await apiFetch(`/api/products/${productId}/reviews`);
      if (rres.ok) {
        const rdata = await rres.json();
        onReviewsUpdate(rdata.reviews, response.averageRating, response.reviewCount);
      }
      reset({ rating: 5, comment: '' });
    }
  };

  return (
    <div className={`bg-base-100 rounded-2xl shadow-lg p-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, i) => (
            <div key={i} className="border-b border-base-300 pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-base-content/70">
                    by {review.userEmail}
                  </span>
                </div>
              </div>
              <p className="text-base-content/90">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base-content/70 italic">No reviews yet. Be the first to review this product!</p>
      )}

      {/* Review Form */}
      {user && (
        <div className="mt-8 p-6 bg-base-200/50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Rating</label>
              <SelectDropdown
                name="rating"
                control={control}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  label: `${n} Star${n !== 1 ? 's' : ''}`,
                  value: String(n),
                }))}
                rules={{ valueAsNumber: true }}
                className="max-w-xs"
              />
            </div>
            <Textarea
              className="w-full"
              placeholder="Share your experience with this product..."
              register={register}
              name="comment"
            />
            <button
              className="btn btn-primary transition-all duration-200"
              type="submit"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 