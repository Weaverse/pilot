import { Image, type VariantOptionValue } from "@shopify/hydrogen";
import { type SwatchesConfigs, useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { ProductVariantFragmentFragment } from "storefrontapi.generated";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/lib/cn";

let variants = cva("border border-line/75 hover:border-body cursor-pointer", {
  variants: {
    colorSize: {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    },
    buttonSize: {
      sm: "min-w-8 h-8",
      md: "min-w-10 h-10",
      lg: "min-w-12 h-12",
    },
    imageSize: {
      sm: "w-12 h-auto",
      md: "w-16 h-auto",
      lg: "w-20 h-auto",
    },
    shape: {
      square: "",
      circle: "rounded-full",
      round: "rounded-md",
    },
    selected: {
      true: "border-body",
      false: "",
    },
    disabled: {
      true: "diagonal",
      false: "",
    },
  },
});

interface VariantOptionProps {
  selectedOptionValue: string;
  onSelectOptionValue: (value: string) => void;
  name: string;
  values: (VariantOptionValue & {
    image?: ProductVariantFragmentFragment["image"];
  })[];
}

export function VariantOption(props: VariantOptionProps) {
  let { name, values, selectedOptionValue, onSelectOptionValue } = props;
  let themeSettings = useThemeSettings();
  let productSwatches: SwatchesConfigs = themeSettings.productSwatches;
  let { options, swatches } = productSwatches;
  let optionConf = options.find((opt) => {
    return opt.name.toLowerCase() === name.toLowerCase();
  });

  let {
    displayName,
    shape = "square",
    size = "md",
    type = "default",
  } = optionConf || {};
  return (
    <div className="space-y-1.5">
      <legend>
        <span className="font-bold">{displayName || name}:</span>
        <span className="ml-2">{selectedOptionValue}</span>
      </legend>

      {type === "button" && (
        <div className="flex gap-3">
          {values.map(({ value, isAvailable }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "px-4 py-2.5 text-center text-body !leading-none",
                variants({
                  buttonSize: size,
                  shape,
                  selected: selectedOptionValue === value,
                  disabled: !isAvailable,
                }),
                !isAvailable && "bg-neutral-100",
              )}
              onClick={() => onSelectOptionValue(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      {type === "color" && (
        <div className="flex gap-3">
          {values.map(({ value, isAvailable }) => {
            let swatchColor = swatches.colors.find(
              ({ name }) => name === value,
            );
            return (
              <Tooltip key={value}>
                <TooltipTrigger>
                  <button
                    type="button"
                    className={cn(
                      "p-1",
                      variants({
                        colorSize: size,
                        shape,
                        selected: selectedOptionValue === value,
                        disabled: !isAvailable,
                      }),
                    )}
                    onClick={() => onSelectOptionValue(value)}
                  >
                    <span
                      className={cn(
                        "w-full h-full inline-block border-none hover:border-none",
                        variants({ shape }),
                      )}
                      style={{ backgroundColor: swatchColor?.value || value }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{value}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
      {type === "custom-image" && (
        <div className="flex gap-3">
          {values.map(({ value, image, isAvailable }) => {
            let swatchImage = swatches.images.find(
              (i) => i.name.toLowerCase() === value.toLowerCase(),
            );
            let imageToRender = swatchImage?.value || image;
            let aspectRatio = "1/1";
            if (image && shape !== "circle") {
              aspectRatio = `${image.width}/${image.height}`;
            }
            return (
              <div
                key={value}
                className={clsx(
                  variants({
                    imageSize: size,
                    shape,
                    selected: selectedOptionValue === value,
                    disabled: !isAvailable,
                  }),
                )}
                onClick={() => onSelectOptionValue(value)}
                style={{ aspectRatio }}
              >
                {imageToRender ? (
                  <Image
                    data={
                      typeof imageToRender === "object"
                        ? imageToRender
                        : {
                            url: imageToRender,
                            altText: value,
                          }
                    }
                    className={cn(
                      "w-full h-full object-cover object-center border-none hover:border-none",
                      variants({ shape }),
                    )}
                    sizes="auto"
                  />
                ) : (
                  <span
                    className={cn(
                      "w-full h-full inline-block",
                      variants({ shape }),
                    )}
                    style={{ backgroundColor: value }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {type === "variant-image" && (
        <div className="flex gap-3">
          {values.map(({ value, image, isAvailable }) => {
            let aspectRatio = "1/1";
            if (image && shape !== "circle") {
              aspectRatio = `${image.width}/${image.height}`;
            }
            return (
              <button
                type="button"
                key={value}
                className={cn(
                  variants({
                    imageSize: size,
                    shape,
                    selected: selectedOptionValue === value,
                    disabled: !isAvailable,
                  }),
                  !isAvailable && "opacity-75",
                )}
                onClick={() => onSelectOptionValue(value)}
                style={{ aspectRatio }}
              >
                {image ? (
                  <Image
                    data={image}
                    sizes="auto"
                    className={cn(
                      "w-full h-full object-cover object-center",
                      variants({ shape }),
                    )}
                  />
                ) : (
                  <span>{value}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {type === "dropdown" && (
        <select
          className="min-w-32 w-fit border px-3 py-2 border-line"
          onChange={(e) => {
            onSelectOptionValue(e.target.value);
          }}
        >
          {values.map(({ value }) => {
            return (
              <option key={value} value={value}>
                {value}
              </option>
            );
          })}
        </select>
      )}
      {type === "default" && (
        <div className="flex gap-3">
          {values.map((value) => (
            <span
              key={value.value}
              className={cn(
                "py-0.5 cursor-pointer border-b border-line/75 hover:border-body",
                selectedOptionValue === value.value && "border-body",
                !value.isAvailable && "opacity-50",
              )}
              onClick={() => onSelectOptionValue(value.value)}
              role="listitem"
            >
              {value.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
