import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { cn } from "~/lib/cn";
import type { SwatchesConfigs } from "~/types/weaverse-hydrogen";

let SIZE_MAP = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

let BUTTON_SIZE_MAP = {
  sm: "min-w-8 h-8",
  md: "min-w-10 h-10",
  lg: "min-w-12 h-12",
};

let variants = cva("", {
  variants: {
    size: {
      sm: "min-w-8 h-8",
      md: "min-w-10 h-10",
      lg: "min-w-12 h-12",
    },
    shape: {
      square: "",
      circle: "rounded-full",
      round: "rounded-md",
    },
  },
});

interface VariantOptionProps {
  selectedOptionValue: string;
  onSelectOptionValue: (value: string) => void;
  name: string;
  values: {
    isActive: boolean;
    isAvailable: boolean;
    search: string;
    to: string;
    value: string;
    image?: any;
  }[];
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

  let roundedClassName =
    shape === "circle" ? "rounded-full" : shape === "round" ? "rounded-md" : "";

  let defaultClassName = clsx(
    "border cursor-pointer",
    SIZE_MAP[size],
    roundedClassName,
  );
  let disabledClassName = "diagonal opacity-50";
  return (
    <div className="space-y-4">
      <legend className="whitespace-pre-wrap max-w-prose leading-snug min-w-[4rem]">
        <span className="font-bold">{displayName || name}:</span>
        <span className="ml-2">{selectedOptionValue}</span>
      </legend>

      {type === "button" && (
        <div className="flex gap-4">
          {values.map(({ value, isAvailable }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "border cursor-pointer p-2 text-sm text-center",
                variants({ size, shape }),
                selectedOptionValue === value && "bg-btn text-btn-content",
                !isAvailable && "opacity-50",
              )}
              onClick={() => onSelectOptionValue(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {type === "color" && (
        <div className="flex gap-4">
          {values.map((optValue) => {
            let swatchColor: string =
              swatches.colors.find((c) => c.name === optValue.value)?.value ||
              optValue.value;
            return (
              <button
                key={optValue.value}
                type="button"
                className={clsx(
                  defaultClassName,
                  "p-1",
                  selectedOptionValue === optValue.value &&
                    "border-2 border-line/70",
                  !optValue.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(optValue.value)}
              >
                <div
                  className={clsx("w-full h-full", roundedClassName)}
                  style={{
                    backgroundColor: swatchColor,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
      {type === "custom-image" && (
        <div className="flex gap-4">
          {values.map((optValue) => {
            let swatchImage =
              swatches.images.find((i) => i.name === optValue.value)?.value ||
              "";
            return (
              <button
                type="button"
                key={optValue.value}
                className={clsx(
                  defaultClassName,
                  "p-0.5",
                  selectedOptionValue === optValue.value &&
                    "border-2 border-line/70",
                  !optValue.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(optValue.value)}
              >
                <Image
                  data={
                    typeof swatchImage === "object"
                      ? swatchImage
                      : {
                          url: swatchImage,
                          altText: optValue.value,
                        }
                  }
                  className={clsx(
                    "w-full h-full object-cover",
                    roundedClassName,
                  )}
                  sizes="auto"
                />
              </button>
            );
          })}
        </div>
      )}
      {type === "variant-image" && (
        <div className="flex gap-4">
          {values.map((optValue) => {
            return (
              <button
                type="button"
                key={optValue.value}
                className={clsx(
                  defaultClassName,
                  selectedOptionValue === optValue.value &&
                    "border-2 border-line/70",
                  !optValue.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(optValue.value)}
              >
                <Image data={optValue.image} sizes="auto" />
              </button>
            );
          })}
        </div>
      )}
      {type === "dropdown" && (
        <div>
          <select
            className="min-w-[120px] w-fit rounded-sm border p-1"
            onChange={(e) => {
              onSelectOptionValue(e.target.value);
            }}
          >
            {values.map((value) => {
              return (
                <option key={value.value} value={value.value}>
                  {value.value}
                </option>
              );
            })}
          </select>
        </div>
      )}
      {type === "default" && (
        <div className="flex gap-4">
          {values.map((value) => (
            <div
              key={value.value}
              className={clsx(
                "leading-none py-1 cursor-pointer transition-all duration-200",
                selectedOptionValue === value.value &&
                  "border-line/50 border-b-[1.5px]",
                !value.isAvailable && "opacity-50",
              )}
              onClick={() => onSelectOptionValue(value.value)}
              role="listitem"
            >
              {value.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
