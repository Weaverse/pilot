import { StarIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeReviewsData } from "~/utils/judgeme";

export function ReviewForm({ reviews }: { reviews: JudgemeReviewsData }) {
  const { product } = useLoaderData<typeof productRouteLoader>();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const fetcher = useFetcher<any>();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const internalId = product.id.split("gid://shopify/Product/")[1];
  const submittable = rating > 0;

  useEffect(() => {
    if ((fetcher.data as Response)?.ok) {
      // setMessage((fetcher.data as Response)?.message || "");
      setIsFormVisible(false);
      setIsPopupVisible(true);
      setRating(0);
      setHover(0);
      (formRef as React.RefObject<HTMLFormElement>).current?.reset();
    }
  }, [fetcher.data]);

  return (
    <div
      className={clsx(
        "flex w-full flex-col gap-5",
        reviews.reviews.length !== 0 && "md:w-2/5 lg:w-1/3",
      )}
    >
      {reviews.reviews.length !== 0 || !isFormVisible ? (
        <div
          className={clsx(
            "flex flex-col gap-4 bg-line-subtle p-6",
            reviews.reviews.length === 0 ? "items-center" : "items-start",
          )}
        >
          <p className="mb-1.5 font-bold text-lg uppercase">
            product reviews ({reviews.reviewNumber})
          </p>
          <div className="flex items-center justify-start gap-3">
            {reviews?.rating ? (
              <>
                <h4 className="font-medium">{reviews.rating.toFixed(1)}</h4>
                <div className="flex gap-0.5">
                  <StarRating rating={reviews.rating} />
                </div>
              </>
            ) : (
              <p>
                We'd love to hear from you. Provide a review for this product.
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFormVisible(true)} // Show form
            disabled={isFormVisible || isPopupVisible}
          >
            WRITE A REVIEW
          </Button>
        </div>
      ) : null}
      {isFormVisible && (
        <div
          className={clsx(
            "w-full bg-line-subtle p-6",
            reviews.reviews.length === 0 && "flex justify-center",
          )}
        >
          <div
            className={clsx(
              "flex w-full flex-col gap-4",
              reviews.reviews.length === 0 && "md:w-2/5 lg:w-1/3",
            )}
          >
            <div className="flex flex-col gap-6">
              <span
                className={clsx(
                  "font-heading font-semibold text-xl uppercase",
                  reviews.reviews.length === 0 && "text-center",
                )}
              >
                WRITE YOUR REVIEW
              </span>
              <div className="flex flex-col gap-3">
                <span className="font-bold text-base">Rating</span>
                <div className="flex items-center pr-1">
                  {[...new Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <div
                        key={index}
                        onClick={() =>
                          ((value: number) => {
                            setRating(value);
                          })(ratingValue)
                        }
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        {ratingValue <= (hover || rating) ? (
                          <StarIcon weight="fill" />
                        ) : (
                          <StarIcon />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Review Form */}
            <fetcher.Form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                fetcher.submit(event.currentTarget);
              }}
              ref={formRef}
              method="POST"
              encType="multipart/form-data"
            >
              <input type="hidden" name="rating" value={rating} />
              <input type="hidden" name="id" value={internalId} />
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block font-bold text-gray-700"
                >
                  Your name
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full border border-line px-3 py-3 outline-hidden focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-2 block font-bold text-gray-700"
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border border-line px-3 py-3 outline-hidden focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="mb-2 block font-bold text-gray-700"
                >
                  Review title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full border border-line px-3 py-3 outline-hidden focus-visible:border-line"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="review-body"
                  className="mb-2 block font-bold text-gray-700"
                >
                  Your review
                </label>
                <textarea
                  id="review-body"
                  name="body"
                  className="w-full border border-line px-3 py-3 outline-hidden focus-visible:border-line"
                  rows={4}
                />
              </div>
              {message && (
                <div className="mb-6 flex w-fit gap-1 border-red-500 border-l-4 bg-red-100 px-2 py-1 text-red-700">
                  <p className="font-semibold">ERROR:</p>
                  <p>{message}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsFormVisible(false)}
                  className="border-none! bg-background"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  loading={fetcher.state === "submitting"}
                  disabled={!submittable}
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
            "flex flex-col gap-6 bg-line-subtle p-6",
            reviews.reviews.length === 0 && "items-center",
          )}
          role="alert"
        >
          <p className="font-bold text-lg">REVIEW SUBMITTED</p>
          <p className="font-normal text-base">
            Thanks for leaving your review!
          </p>
          <div
            className={clsx(
              "flex items-center",
              reviews.reviews.length === 0 ? "justify-center" : "justify-end",
            )}
          >
            <Button
              onClick={() => {
                setIsPopupVisible(false);
              }}
              variant="outline"
              className="border-none! bg-background"
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
