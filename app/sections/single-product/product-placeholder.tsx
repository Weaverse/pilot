import { IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";

export function ProductPlaceholder() {
  return (
    <div className="container px-4 md:px-6 mx-auto pointer-events-none">
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
        <img
          alt=""
          decoding="async"
          height="125"
          loading="lazy"
          src={IMAGES_PLACEHOLDERS.product_2}
          width="100"
          className="object-cover w-full h-full aspect-square opacity-0 animate-fade-in"
          style={{ width: "100%" }}
        />

        <div className="flex flex-col justify-start space-y-5">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              EXAMPLE PRODUCT TITLE
            </h2>
            <p className="text-2xl text-zinc-500 md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed dark:text-zinc-400">
              <span>$99</span>
            </p>
            <p className="max-w-[600px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
              Product description
            </p>
          </div>
          <div>
            <button
              className="inline-block rounded-sm font-medium text-center py-3 px-4 text-sm border-2 border-btn hover:bg-inv-btn hover:text-inv-btn-content bg-btn text-btn-content w-full"
              type="submit"
              data-test="add-to-cart"
            >
              <span> Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
