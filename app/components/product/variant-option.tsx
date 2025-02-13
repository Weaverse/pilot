import { CaretDown, CaretUp, Check } from "@phosphor-icons/react";
import * as Select from "@radix-ui/react-select";
import { useNavigate } from "@remix-run/react";
import { Image, type VariantOptionValue } from "@shopify/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import Link from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { isLightColor } from "~/utils/misc";

export const OPTIONS_AS_SWATCH = ["Color", "Colors", "Colour", "Colours"];
const OPTIONS_AS_BUTTON = ["Size"];
const OPTIONS_AS_IMAGE = [];
const OPTIONS_AS_DROPDOWN = [];

export let variants = cva(
  "border border-line hover:border-body cursor-pointer",
  {
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
  },
);

interface VariantOptionProps {
  option: {
    name: string;
    value?: string;
    values: Array<
      VariantOptionValue & {
        isUnavailable: boolean;
      }
    >;
  };
}

export function VariantOption({ option }: VariantOptionProps) {
  if (!option?.name) return null;

  let { name, value, values } = option;
  let navigate = useNavigate();

  if (OPTIONS_AS_SWATCH.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(({ value, optionValue, isUnavailable, isActive, to }) => {
          let { swatch } = optionValue;
          return (
            <Tooltip key={value}>
              <TooltipTrigger>
                <Link
                  to={to}
                  preventScrollReset
                  prefetch="intent"
                  replace
                  className={clsx(
                    "size-[--option-swatch-size] flex aspect-square cursor-pointer",
                    "rounded-full overflow-hidden",
                    "transition-[outline-color] outline outline-offset-2 outline-1",
                    isActive
                      ? "outline-line"
                      : "outline-transparent hover:outline-line",
                    isUnavailable && "diagonal",
                  )}
                >
                  {swatch?.image?.previewImage ? (
                    <Image
                      data={swatch.image.previewImage}
                      className="w-full h-full object-cover object-center"
                      width={200}
                      sizes="auto"
                    />
                  ) : (
                    <span
                      className={clsx(
                        "w-full h-full inline-block text-[0px] rounded-full",
                        isLightColor(swatch?.color || value) &&
                          "border border-line-subtle",
                      )}
                      style={{ backgroundColor: swatch?.color || value }}
                    >
                      {value}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>{value}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  if (OPTIONS_AS_BUTTON.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(({ value, to, isActive, isUnavailable }) => (
          <Link
            key={value}
            to={to}
            preventScrollReset
            prefetch="intent"
            replace
            className={clsx(
              "px-4 py-2.5 text-center border border-line-subtle transition-colors",
              isActive
                ? [
                    isUnavailable
                      ? "text-body-subtle"
                      : "text-body-inverse bg-body",
                    "border-body",
                  ]
                : "hover:border-line",
              isUnavailable && "text-body-subtle diagonal bg-gray-100",
            )}
          >
            {value}
          </Link>
        ))}
      </div>
    );
  }

  if (OPTIONS_AS_IMAGE.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(({ value, optionValue, isUnavailable, isActive, to }) => {
          let { firstSelectableVariant } = optionValue;
          return (
            <Tooltip key={value}>
              <TooltipTrigger>
                <Link
                  to={to}
                  preventScrollReset
                  prefetch="intent"
                  replace
                  className={clsx(
                    "flex items-center justify-center p-1 w-[--option-image-width] h-auto",
                    "text-center border border-line-subtle transition-colors",
                    isActive
                      ? [
                          isUnavailable
                            ? "text-body-subtle"
                            : "text-body-inverse",
                          "border-body",
                        ]
                      : "hover:border-line",
                    isUnavailable && "text-body-subtle diagonal opacity-75",
                  )}
                >
                  {firstSelectableVariant?.image ? (
                    <Image
                      data={firstSelectableVariant?.image}
                      sizes="auto"
                      width={200}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span>{value}</span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent>{value}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  if (OPTIONS_AS_DROPDOWN.includes(name)) {
    return (
      <Select.Root
        value={value}
        onValueChange={(v) => {
          let { to } = values.find(({ value }) => value === v);
          navigate(to);
        }}
      >
        <Select.Trigger
          className="inline-flex border border-line h-10 items-center justify-center gap-3 bg-white pl-4 pr-3 py-3 outline-none"
          aria-label={name}
        >
          <Select.Value />
          <Select.Icon className="shrink-0">
            <CaretDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
            <Select.ScrollUpButton className="cursor-pointer flex items-center justify-center hover:bg-gray-100">
              <CaretUp size={16} />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1.5">
              {values.map(({ value, isActive, isUnavailable }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className={clsx(
                    "flex gap-4 cursor-pointer w-full items-center justify-between hover:bg-gray-100 outline-none h-10 select-none pl-4 pr-2 py-2.5",
                    isUnavailable && "text-body-subtle line-through",
                  )}
                >
                  <Select.ItemText>{value}</Select.ItemText>
                  {isActive && (
                    <Select.ItemIndicator className="inline-flex w-6 shrink-0 items-center justify-center">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="cursor-pointer flex items-center justify-center rounded-lg hover:bg-info-100 dark:hover:bg-info-700">
              <CaretDown size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {values.map(({ value, to, isActive, isUnavailable }) => (
        <Link
          key={value}
          to={to}
          preventScrollReset
          prefetch="intent"
          replace
          className={clsx(
            "py-0.5 cursor-pointer border-b",
            isActive
              ? [isUnavailable ? "border-line-subtle" : "border-line"]
              : [
                  "border-transparent",
                  isUnavailable
                    ? "hover:border-line-subtle"
                    : "hover:border-line",
                ],
            isUnavailable && "text-body-subtle line-through",
          )}
        >
          {value}
        </Link>
      ))}
    </div>
  );
}
