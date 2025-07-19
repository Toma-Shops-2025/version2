import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface ReviewsProps {
  sellerId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ sellerId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data);
        if (data && data.length > 0) {
          const total = data.reduce((acc, review) => acc + review.rating, 0);
          setAvgRating(total / data.length);
        }
      }
      setLoading(false);
    };

    fetchReviews();
  }, [sellerId]);

  if (loading) return <div>Loading reviews...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Seller Reviews
          {avgRating !== null && (
            <span className="ml-4 flex items-center text-lg font-normal">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
              {avgRating.toFixed(1)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-2">
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Reviews; 