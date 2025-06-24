import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as Select from "@radix-ui/react-select";
import { Image, type VariantOptionValue } from "@shopify/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router";
import Link, { type LinkProps } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { isLightColor } from "~/utils/misc";

export const OPTIONS_AS_SWATCH = ["Color", "Colors", "Colour", "Colours"];
const OPTIONS_AS_BUTTON = ["Size"];
const OPTIONS_AS_IMAGE = [];
const OPTIONS_AS_DROPDOWN = [];

export const variants = cva(
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
        isDifferentProduct?: boolean;
        to: string;
      }
    >;
  };
}

/**
 * SEO: When the variant is a combined listing child product that leads to a different URL,
 * we need to render it as an anchor tag.
 * When the variant is an update to the search param, render it as a button with JavaScript navigating to
 * the variant so that SEO bots do not index these as duplicated links.
 */

export function VariantOption({ option }: VariantOptionProps) {
  const navigate = useNavigate();

  if (!option?.name) return null;

  const { name, value, values } = option;

  if (OPTIONS_AS_SWATCH.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(
          ({
            value,
            optionValue,
            isUnavailable,
            isActive,
            to,
            isDifferentProduct,
          }) => {
            const { swatch } = optionValue;
            const Component = isDifferentProduct ? Link : "button";
            const linkProps: LinkProps = {
              to,
              preventScrollReset: true,
              prefetch: "intent",
              replace: true,
            };
            const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
              type: "button" as const,
              disabled: isUnavailable,
              onClick: () => {
                if (!isActive && !isUnavailable) {
                  navigate(to, { replace: true });
                }
              },
            };
            return (
              <Tooltip key={value}>
                <TooltipTrigger>
                  {/* @ts-expect-error: TypeScript cannot infer the correct props for variable component */}
                  <Component
                    {...(isDifferentProduct ? linkProps : buttonProps)}
                    className={clsx(
                      "size-(--option-swatch-size) flex aspect-square cursor-pointer",
                      "rounded-full overflow-hidden",
                      "transition-[outline-color] [outline-style:solid] outline-offset-2 outline-1",
                      isActive
                        ? "outline-line"
                        : "outline-transparent hover:outline-line",
                      isUnavailable && "diagonal",
                    )}
                    style={{ background: swatch?.color || value }}
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
                  </Component>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>{value}</TooltipContent>
              </Tooltip>
            );
          },
        )}
      </div>
    );
  }

  if (OPTIONS_AS_BUTTON.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(
          ({ value, to, isActive, isUnavailable, isDifferentProduct }) => {
            const Component = isDifferentProduct ? Link : "button";
            const linkProps: LinkProps = {
              to,
              preventScrollReset: true,
              prefetch: "intent",
              replace: true,
            };
            const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
              type: "button" as const,
              disabled: isUnavailable,
              onClick: () => {
                if (!isActive && !isUnavailable) {
                  navigate(to, { replace: true });
                }
              },
            };
            return (
              // @ts-expect-error: TypeScript cannot infer the correct props for variable component
              <Component
                key={value}
                {...(isDifferentProduct ? linkProps : buttonProps)}
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
              </Component>
            );
          },
        )}
      </div>
    );
  }
  if (OPTIONS_AS_IMAGE.includes(name)) {
    return (
      <div className="flex flex-wrap gap-3">
        {values.map(
          ({
            value,
            optionValue,
            isUnavailable,
            isActive,
            to,
            isDifferentProduct,
          }) => {
            const { firstSelectableVariant } = optionValue;
            const Component = isDifferentProduct ? Link : "button";
            const linkProps: LinkProps = {
              to,
              preventScrollReset: true,
              prefetch: "intent",
              replace: true,
            };
            const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
              type: "button" as const,
              disabled: isUnavailable,
              onClick: () => {
                if (!isActive && !isUnavailable) {
                  navigate(to, { replace: true });
                }
              },
            };
            return (
              <Tooltip key={value}>
                <TooltipTrigger>
                  {/* @ts-expect-error: TypeScript cannot infer the correct props for variable component */}
                  <Component
                    {...(isDifferentProduct ? linkProps : buttonProps)}
                    className={clsx(
                      "flex items-center justify-center p-1 w-(--option-image-width) h-auto",
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
                  </Component>
                </TooltipTrigger>
                <TooltipContent>{value}</TooltipContent>
              </Tooltip>
            );
          },
        )}
      </div>
    );
  }

  if (OPTIONS_AS_DROPDOWN.includes(name)) {
    return (
      <Select.Root
        value={value}
        onValueChange={(v) => {
          const found = values.find(({ value }) => value === v);
          if (found) {
            if (found.isDifferentProduct) {
              window.location.href = found.to;
            } else {
              navigate(found.to, { replace: true });
            }
          }
        }}
      >
        <Select.Trigger
          className="inline-flex border border-line h-10 items-center justify-center gap-3 bg-white pl-4 pr-3 py-3 outline-hidden"
          aria-label={name}
        >
          <Select.Value />
          <Select.Icon className="shrink-0">
            <CaretDownIcon size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]">
            <Select.ScrollUpButton className="cursor-pointer flex items-center justify-center hover:bg-gray-100">
              <CaretUpIcon size={16} />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1.5">
              {values.map(({ value, isActive, isUnavailable }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className={clsx(
                    "flex gap-4 cursor-pointer w-full items-center justify-between hover:bg-gray-100 outline-hidden h-10 select-none pl-4 pr-2 py-2.5",
                    isUnavailable && "text-body-subtle line-through",
                  )}
                >
                  <Select.ItemText>{value}</Select.ItemText>
                  {isActive && (
                    <Select.ItemIndicator className="inline-flex w-6 shrink-0 items-center justify-center">
                      <CheckIcon size={16} />
                    </Select.ItemIndicator>
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="cursor-pointer flex items-center justify-center rounded-lg hover:bg-info-100 dark:hover:bg-info-700">
              <CaretDownIcon size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  // Default fallback
  return (
    <div className="flex flex-wrap gap-3">
      {values.map(
        ({ value, to, isActive, isUnavailable, isDifferentProduct }) => {
          const Component = isDifferentProduct ? Link : "button";
          const linkProps: LinkProps = {
            to,
            preventScrollReset: true,
            prefetch: "intent",
            replace: true,
          };
          const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
            type: "button" as const,
            disabled: isUnavailable,
            onClick: () => {
              if (!isActive && !isUnavailable) {
                navigate(to, { replace: true });
              }
            },
          };
          return (
            // @ts-expect-error: TypeScript cannot infer the correct props for variable component
            <Component
              key={value}
              {...(isDifferentProduct ? linkProps : buttonProps)}
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
            </Component>
          );
        },
      )}
    </div>
  );
}
