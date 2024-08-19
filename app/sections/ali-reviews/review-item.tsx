import clsx from "clsx";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { IconSealCheck, IconX } from "~/components/icons";
import { Rating } from "./rating";

export type AliReview = {
  id: number;
  product_id: number;
  order_id: number;
  author: string;
  country: string;
  star: number;
  content: string;
  email: string;
  media: ReviewMedia[];
  total_likes: number;
  total_dislikes: number;
  created_at: string;
  updated_at: string;
  shop_id: number;
  reply: any;
};

type ReviewMedia = {
  id: number;
  product_id: number;
  comment_id: number;
  type: string;
  url: string;
  created_at: string;
  metadata: any[];
};

export type ReviewItemData = {
  showCountry: boolean;
  showDate: boolean;
  showVerifiedBadge: boolean;
  verifiedBadgeText: string;
  showStar: boolean;
};

type ReviewItemProps = ReviewItemData & {
  review: AliReview;
};

export function ReviewItem(props: ReviewItemProps) {
  let {
    review,
    showCountry,
    showDate,
    showVerifiedBadge,
    verifiedBadgeText,
    showStar,
  } = props;
  let [previewMedia, setPreviewMedia] = useState<ReviewMedia | null>(null);

  return (
    <div className="gap-3 py-6 space-y-4">
      <div className="space-y-2 md:flex justify-between w-full">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">{review.author}</span>
            {showCountry && (
              <ReactCountryFlag
                svg
                countryCode={review.country}
                style={{ width: "24px", height: "14px" }}
                className="mb-0.5"
              />
            )}
          </div>
          {showDate && (
            <p className="text-sm font-normal text-gray-500">
              {formatDate(review.created_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-6">
          {showVerifiedBadge && (
            <div className="inline-flex items-center gap-1">
              <IconSealCheck className="h-4 w-4 text-white" fill="black" />
              <p className="text-xs">{verifiedBadgeText}</p>
            </div>
          )}
          {showStar && (
            <div className="flex items-center gap-0.5">
              <Rating rating={review.star} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 min-w-0 flex-1 space-y-4 sm:mt-0">
        <p className="text-base font-normal">{review.content}</p>
        <div className="flex gap-3 flex-wrap">
          {review.media.map((media) => (
            <div
              key={media.id}
              role="button"
              className={clsx(
                "flex items-center justify-center bg-gray-800 w-20 h-20 overflow-hidden cursor-pointer",
                "outline-offset-2 hover:outline hover:outline-2 hover:outline-gray-500",
                previewMedia?.id === media.id &&
                  "outline outline-2 outline-gray-500",
              )}
              onClick={() => {
                if (previewMedia?.id === media.id) {
                  setPreviewMedia(null);
                } else {
                  setPreviewMedia(media);
                }
              }}
            >
              <img
                className="w-full h-full object-cover object-center"
                src={media.url}
                alt="Review media"
              />
            </div>
          ))}
        </div>
        <ReviewMediaPreview
          media={previewMedia}
          closePreview={() => setPreviewMedia(null)}
        />
      </div>
    </div>
  );
}

function ReviewMediaPreview(props: {
  media: ReviewMedia | null;
  closePreview: () => void;
}) {
  let { media, closePreview } = props;
  if (media) {
    return (
      <div className="flex gap-2 items-start">
        <div className="w-96 h-96 flex items-center justify-center overflow-hidden bg-gray-800">
          <img
            className="max-w-full max-h-full object-cover"
            src={media.url}
            alt="Review media preview"
          />
        </div>
        <IconX
          className="w-5 h-5 cursor-pointer text-gray-600"
          onClick={closePreview}
        />
      </div>
    );
  }
  return null;
}

function formatDate(date: string) {
  let dateObj = new Date(date);
  let dateStr = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let timeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
  return `${dateStr} at ${timeStr}`;
}
