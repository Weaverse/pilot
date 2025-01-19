import { Star } from "@phosphor-icons/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "~/components/button";
import { StarRating } from "~/components/star-rating";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";
import type { JudgemeReviewsData } from "~/utils/judgeme";

export function ReviewForm({
  reviews,
}: {
  reviews: JudgemeReviewsData;
}) {
  let { product } = useLoaderData<typeof productRouteLoader>();
  let [rating, setRating] = useState(0);
  let [hover, setHover] = useState(0);
  let [isFormVisible, setIsFormVisible] = useState(false);
  let [isPopupVisible, setIsPopupVisible] = useState(false);
  let fetcher = useFetcher<any>();
  let formRef = useRef<HTMLFormElement>(null);
  let [message, setMessage] = useState("");
  let internalId = product.id.split("gid://shopify/Product/")[1];
  let submittable = rating > 0;

  useEffect(() => {
    if (fetcher.data) {
      // setMessage((fetcher.data as Response)?.message || "");
      if ((fetcher.data as Response).ok) {
        setIsFormVisible(false);
        setIsPopupVisible(true);
        setRating(0);
        setHover(0);
        (formRef as React.MutableRefObject<HTMLFormElement>).current?.reset();
      }
    }
  }, [fetcher.data]);

  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-5",
        reviews.reviews.length !== 0 && "lg:w-1/3 md:w-2/5",
      )}
    >
      {reviews.reviews.length !== 0 || !isFormVisible ? (
        <div
          className={clsx(
            "flex flex-col gap-4 bg-line-subtle p-6",
            reviews.reviews.length === 0 ? "items-center" : "items-start",
          )}
        >
          <p className="uppercase font-bold text-lg mb-1.5">
            product reviews ({reviews.reviewNumber})
          </p>
          <div className="flex justify-start items-center gap-3">
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
            "bg-line-subtle p-6 w-full",
            reviews.reviews.length === 0 && "flex justify-center",
          )}
        >
          <div
            className={clsx(
              "w-full flex flex-col gap-4",
              reviews.reviews.length === 0 && "lg:w-1/3 md:w-2/5",
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
                <span className="text-base font-bold">Rating</span>
                <div className="flex items-center pr-1">
                  {[...Array(5)].map((_, index) => {
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
                        aria-label={`Rate ${ratingValue} out of 5 stars`}
                      >
                        {ratingValue <= (hover || rating) ? (
                          <Star weight="fill" />
                        ) : (
                          <Star />
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
                  htmlFor="review-body"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Your review
                </label>
                <textarea
                  id="review-body"
                  name="body"
                  className="w-full border px-3 py-3 border-line outline-none focus-visible:border-line"
                  rows={4}
                />
              </div>
              {message && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 py-1 px-2 mb-6 flex gap-1 w-fit">
                  <p className="font-semibold">ERROR:</p>
                  <p>{message}</p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsFormVisible(false)}
                  className="!border-none bg-background"
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
            "flex flex-col gap-6 p-6 bg-line-subtle",
            reviews.reviews.length === 0 && "items-center",
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
              reviews.reviews.length === 0 ? "justify-center" : "justify-end",
            )}
          >
            <Button
              onClick={() => {
                setIsPopupVisible(false);
              }}
              variant="outline"
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
