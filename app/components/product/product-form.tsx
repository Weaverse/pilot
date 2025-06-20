import type { MappedProductOptions } from "@shopify/hydrogen";
import type {
  Maybe,
  ProductOptionValueSwatch,
} from "@shopify/hydrogen/storefront-api-types";
import { Link, useNavigate } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import { AddToCartButton } from "./add-to-cart-button";

interface ProductFormProps {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductQuery["product"]["selectedOrFirstAvailableVariant"];
}

export function ProductForm({
  productOptions,
  selectedVariant,
}: ProductFormProps) {
  const navigate = useNavigate();

  return (
    <div className="product-form space-y-5">
      {productOptions.map((option) => (
        <div className="product-options space-y-1.5" key={option.name}>
          <legend className="leading-tight">
            <span className="font-bold">{option.name}</span>
          </legend>
          <div className="product-options-grid flex flex-wrap gap-2">
            {option.optionValues.map((value) => {
              const {
                name,
                handle,
                variantUriQuery,
                selected,
                available,
                exists,
                isDifferentProduct,
                swatch,
              } = value;

              if (isDifferentProduct) {
                // SEO: When the variant is a combined listing child product
                // that leads to a different URL, we need to render it
                // as an anchor tag
                return (
                  <Link
                    className={`product-options-item px-3 py-2 border rounded-lg text-sm transition-colors ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    key={option.name + name}
                    prefetch="intent"
                    preventScrollReset
                    replace
                    to={`/products/${handle}?${variantUriQuery}`}
                    style={{
                      opacity: available ? 1 : 0.3,
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </Link>
                );
              } else {
                // SEO: When the variant is an update to the search param,
                // render it as a button with JavaScript navigating to
                // the variant so that SEO bots do not index these as
                // duplicated links
                return (
                  <button
                    type="button"
                    className={`product-options-item px-3 py-2 border rounded-lg text-sm transition-colors ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    } ${!exists ? "cursor-not-allowed" : ""}`}
                    key={option.name + name}
                    style={{
                      opacity: available ? 1 : 0.3,
                    }}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected && exists) {
                        navigate(`?${variantUriQuery}`, {
                          replace: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              }
            })}
          </div>
        </div>
      ))}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
        variant="primary"
        className="w-full"
      >
        {selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      className="product-option-label-swatch flex items-center gap-2"
      title={name}
    >
      <div
        className="w-4 h-4 rounded-full border border-gray-300"
        style={{
          backgroundColor: color || "transparent",
        }}
      >
        {!!image && (
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </div>
      {name}
    </div>
  );
}
