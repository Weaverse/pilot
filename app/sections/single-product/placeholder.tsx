export function ProductPlaceholder(props: any) {
  return (
    <div className="container px-4 md:px-6 mx-auto pointer-events-none">
      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
        <img
          alt=""
          decoding="async"
          height="125"
          loading="lazy"
          src="https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=100&amp;height=125&amp;crop=center"
          srcSet="https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=200&amp;height=250&amp;crop=center 200w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=400&amp;height=500&amp;crop=center 400w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=600&amp;height=750&amp;crop=center 600w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=800&amp;height=1000&amp;crop=center 800w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=1000&amp;height=1250&amp;crop=center 1000w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=1200&amp;height=1500&amp;crop=center 1200w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=1400&amp;height=1750&amp;crop=center 1400w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=1600&amp;height=2000&amp;crop=center 1600w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=1800&amp;height=2250&amp;crop=center 1800w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=2000&amp;height=2500&amp;crop=center 2000w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=2200&amp;height=2750&amp;crop=center 2200w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=2400&amp;height=3000&amp;crop=center 2400w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=2600&amp;height=3250&amp;crop=center 2600w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=2800&amp;height=3500&amp;crop=center 2800w, https://cdn.shopify.com/s/files/1/0623/5095/0584/products/85cc58608bf138a50036bcfe86a3a362.jpg?v=1657783060&amp;width=3000&amp;height=3750&amp;crop=center 3000w"
          width="100"
          className="object-cover w-full h-full aspect-square fadeIn"
          style={{width: '100%', aspectRatio: '4 / 5'}}
        />

        <div className="flex flex-col justify-start space-y-5">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              PRODUCT TITLE
            </h2>
            <p className="text-2xl text-zinc-500 md:text-3xl/relaxed lg:text-2xl/relaxed xl:text-3xl/relaxed dark:text-zinc-400">
              <span>₫0</span>
            </p>
            <p className="max-w-[600px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
              Product description
            </p>
            <div>
              <div className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0">
                <legend className="whitespace-pre-wrap max-w-prose font-bold text-lg leading-snug min-w-[4rem]">
                  Size
                </legend>
                <div className="flex flex-wrap items-baseline gap-4">
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 border-bar/50 border-b-[1.5px] opacity-100"
                    href="/"
                  >
                    OS
                  </a>
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 opacity-100"
                    href="/"
                  >
                    M
                  </a>
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 opacity-100"
                    href="/"
                  >
                    XL
                  </a>
                </div>
              </div>
              <div className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0">
                <legend className="whitespace-pre-wrap max-w-prose font-bold text-lg leading-snug min-w-[4rem]">
                  Color
                </legend>
                <div className="flex flex-wrap items-baseline gap-4">
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 border-bar/50 border-b-[1.5px] opacity-100"
                    href="/"
                  >
                    black
                  </a>
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 opacity-100"
                    href="/"
                  >
                    red
                  </a>
                  <a
                    className="leading-none py-1 cursor-pointer transition-all duration-200 opacity-100"
                    href="/"
                  >
                    white
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <legend className="whitespace-pre-wrap max-w-prose font-bold text-lg leading-snug">
              Quantity
            </legend>
            <div className="rounded-sm border w-fit">
              <button
                name="decrease-quantity"
                aria-label="Decrease quantity"
                className="w-10 h-10 transition "
              >
                <span>−</span>
              </button>
              <input className="w-12 px-1 py-2.5 text-center" value="1" />
              <button
                className="w-10 h-10 transition text-body hover:text-body"
                name="increase-quantity"
                aria-label="Increase quantity"
              >
                <span>+</span>
              </button>
            </div>
          </div>
          <div>
            <button
              className="inline-block rounded font-medium text-center py-3 px-4 text-sm font-medium border-2 border-btn hover:bg-inv-btn hover:text-inv-btn-content bg-btn text-btn-content w-full"
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
