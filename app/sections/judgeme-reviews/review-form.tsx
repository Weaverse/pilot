import { useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "~/components/button";
import { IconStar, IconStarFilled } from "~/components/icons";
import { JudgemeReviewsData } from "~/lib/judgeme";
import { StarRating } from "~/modules/star-rating";
import { ProductLoaderType } from "~/routes/($locale).products.$productHandle";

export function ReviewForm({
  judgemeReviews,
}: {
  judgemeReviews: JudgemeReviewsData;
}) {
  const { product } = useLoaderData<ProductLoaderType>();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const fetcher = useFetcher<any>();
  const formRef = useRef<HTMLFormElement>(null);
  let [message, setMessage] = useState("");
  const internalId = product.id.split("gid://shopify/Product/")[1];
  const submitable = rating > 0;

  useEffect(() => {
    if (fetcher.data) {
      setMessage((fetcher.data as any)?.message || "");
      if (fetcher.data.success) {
        setIsFormVisible(false);
        setIsPopupVisible(true);
        setRating(0);
        setHover(0);
        (formRef as React.MutableRefObject<HTMLFormElement>).current?.reset();
      }
    }
  }, [fetcher.data]);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    fetcher.submit(event.currentTarget);
  };

  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-5",
        judgemeReviews.reviews.length !== 0 && "lg:w-1/3 md:w-2/5"
      )}
    >
      {judgemeReviews.reviews.length !== 0 || !isFormVisible ? (
        <div
          className={clsx(
            "flex flex-col gap-4 bg-line/30 p-6",
            judgemeReviews.reviews.length === 0 ? "items-center" : "items-start"
          )}
        >
          <p className="uppercase font-bold text-lg mb-1.5">
            product reviews ({judgemeReviews.reviewNumber})
          </p>
          <div className="flex justify-start items-center gap-3">
            {judgemeReviews && judgemeReviews.rating ? (
              <>
                <h4 className="font-medium">
                  {judgemeReviews.rating.toFixed(1)}
                </h4>
                <div className="flex gap-0.5">
                  <StarRating rating={judgemeReviews.rating} />
                </div>
              </>
            ) : (
              <p>
                We'd love to hear from you. Provide a review for this product.
              </p>
            )}
          </div>
          <Button
            onClick={() => setIsFormVisible(true)} // Show form
            disabled={isFormVisible || isPopupVisible}
            variant={"outline"}
          >
            WRITE A REVIEW
          </Button>
        </div>
      ) : null}
      {isFormVisible && (
        <div
          className={clsx(
            "bg-line/30 p-6 w-full",
            judgemeReviews.reviews.length === 0 && "flex justify-center"
          )}
        >
          <div
            className={clsx(
              "w-full flex flex-col gap-4",
              judgemeReviews.reviews.length === 0 && "lg:w-1/3 md:w-2/5"
            )}
          >
            <div className="flex flex-col gap-6">
              <span
                className={clsx(
                  "font-heading font-semibold text-xl uppercase",
                  judgemeReviews.reviews.length === 0 && "text-center"
                )}
              >
                WRITE YOUR REVIEW
              </span>
              <div className="flex flex-col gap-3">
                <span className="text-base font-bold">Rating</span>
                <div className="flex items-center pr-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <div
                        key={index}
                        onClick={() => handleRatingClick(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`Rate ${ratingValue} out of 5 stars`}
                        role="button"
                      >
                        {ratingValue <= (hover || rating) ? (
                          <IconStarFilled />
                        ) : (
                          <IconStar />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Review Form */}
            <fetcher.Form
              onSubmit={handleSubmit}
              ref={formRef}
              method="POST"
              encType="multipart/form-data"
            >
              <input type="hidden" name="rating" value={rating} />
              <input type="hidden" name="id" value={internalId} />
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Your name
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full border px-3 py-3 border-line outline-none focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border px-3 py-3 border-line outline-none focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Review title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full border px-3 py-3 border-line outline-none focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="body"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Your review
                </label>
                <textarea
                  id="body"
                  name="body"
                  className="w-full border px-3 py-3 border-line outline-none focus-visible:border-line"
                  rows={4}
                ></textarea>
              </div>
              {message && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 py-1 px-2 mb-6 flex gap-1 w-fit">
                  <p className="font-semibold">ERROR:</p>
                  <p>{message}</p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setIsFormVisible(false)}
                  variant={"outline"}
                  className="!border-none bg-background"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  loading={fetcher.state === "submitting"}
                  disabled={!submitable}
                >
                  Submit Review
                </Button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
      {isPopupVisible && (
        <div
          className={clsx(
            "flex flex-col gap-6 p-6 bg-line/30",
            judgemeReviews.reviews.length === 0 && "items-center"
          )}
          role="alert"
        >
          <p className="font-bold leading-normal text-lg">REVIEW SUBMITTED</p>
          <p className="font-normal leading-normal text-base">
            Thanks for leaving your review!
          </p>
          <div
            className={clsx(
              "flex items-center",
              judgemeReviews.reviews.length === 0
                ? "justify-center"
                : "justify-end"
            )}
          >
            <Button
              onClick={() => {
                setIsPopupVisible(false);
              }}
              variant={"outline"}
              className="!border-none bg-background"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewForm;
