import { useFetcher, useLoaderData } from "@remix-run/react";
import { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { FormEvent, forwardRef, useEffect, useRef, useState } from "react";
import Button from "~/components/button";
import { IconStar, IconStarFilled } from "~/components/icons";
import { ProductLoaderType } from "~/routes/($locale).products.$productHandle";

type ReviewFormProps = {};

let ReviewForm = forwardRef<HTMLDivElement, ReviewFormProps>((props, ref) => {
  const { product } = useLoaderData<ProductLoaderType>();
  let { ...rest } = props;
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fetcher = useFetcher<any>();
  const formRef = useRef<HTMLFormElement>(null);
  let [message, setMessage] = useState("");
  const internalId = product.id.split("gid://shopify/Product/")[1];
  const submitable = rating > 0;

  useEffect(() => {
    if (fetcher.data) {
      setMessage((fetcher.data as any)?.message || "");
      if (fetcher.data.success) {
        setSubmitSuccess(true);
        setRating(0);
        setHover(0);
        (formRef as React.MutableRefObject<HTMLFormElement>).current?.reset();
      } else {
        setSubmitSuccess(false);
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
    <div ref={ref} {...rest}>
      <div className="flex flex-col sm:flex-row items-center my-6 gap-2">
        <div className="flex items-center">
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
        <span className="text-gray-600">{rating} out of 5</span>
      </div>
      {/* Review Form */}
      <fetcher.Form
        onSubmit={handleSubmit}
        className="mb-8"
        ref={formRef}
        method="POST"
        encType="multipart/form-data"
      >
        <input type="hidden" name="rating" value={rating} />
        <input type="hidden" name="id" value={internalId} />
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            Your name
          </label>
          <input
            required
            type="text"
            id="name"
            name="name"
            className="w-full border px-3 py-3 border-line/30 outline-none focus-visible:border-line"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Your email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            required
            className="w-full border px-3 py-3 border-line/30 outline-none focus-visible:border-line"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Review title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full border px-3 py-3 border-line/30 outline-none focus-visible:border-line"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="body" className="block text-gray-700 font-bold mb-2">
            Your review
          </label>
          <textarea
            id="body"
            name="body"
            className="w-full border px-3 py-3 border-line/30 outline-none focus-visible:border-line"
            rows={4}
          ></textarea>
        </div>

        <Button
          type="submit"
          loading={fetcher.state === "submitting"}
          disabled={!submitable}
        >
          Submit Review
        </Button>
      </fetcher.Form>
      {message && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{message}</p>
        </div>
      )}
      {submitSuccess && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p>Thank you for your review! It has been submitted successfully.</p>
        </div>
      )}
    </div>
  );
});

export default ReviewForm;

export let schema: HydrogenComponentSchema = {
  type: "judgeme-review--form",
  title: "Judgeme Review form",
  inspector: [
    {
      group: "Review form",
      inputs: [],
    },
  ],
};
