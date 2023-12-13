import clsx from 'clsx';
import {Image} from '@shopify/hydrogen';
import type {WeaverseImage} from '@weaverse/hydrogen';
interface VariantOptionProps {
  selectedOptionValue: string;
  onSelectOptionValue: (optionValue: string) => void;
  name: string;
  config: {
    type: string;
    displayName: string;
    size?: 'sm' | 'md' | 'lg';
    shape?: string;
  };
  swatches: {
    imageSwatches: any[];
    colorSwatches: any[];
  };
  values: {
    isActive: boolean;
    isAvailable: boolean;
    search: string;
    to: string;
    value: string;
    image?: any;
  }[];
}

let SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

let BUTTON_SIZE_MAP = {
  sm: 'min-w-[32px] h-8',
  md: 'min-w-[40px] h-10',
  lg: 'min-w-[48px] h-12',
};

export function VariantOption(props: VariantOptionProps) {
  let {
    name,
    values,
    selectedOptionValue,
    onSelectOptionValue,
    swatches,
    config,
  } = props;

  let {displayName, shape = 'square', size = 'md', type = 'default'} = config;

  let roundedClassName =
    shape === 'circle' ? 'rounded-full' : shape === 'round' ? 'rounded-md' : '';

  let defaultClassName = clsx(
    'border cursor-pointer',
    SIZE_MAP[size],
    roundedClassName,
  );

  let defaultButtonClassName = clsx(
    'border cursor-pointer',
    BUTTON_SIZE_MAP[size],
    'p-2 text-sm text-center',
    roundedClassName,
  );

  let disabledClassName = 'diagonal opacity-50';
  // show value by Type
  return (
    <div className="space-y-4">
      <legend className="whitespace-pre-wrap max-w-prose leading-snug min-w-[4rem]">
        <span className="font-bold">{displayName || name}:</span>
        <span className="ml-2">{selectedOptionValue}</span>
      </legend>
      {type === 'button' && (
        <div className="flex gap-4">
          {values.map((value) => (
            <button
              key={value.value}
              className={clsx(
                defaultButtonClassName,
                selectedOptionValue === value.value &&
                  'bg-btn text-btn-content',
                !value.isAvailable && 'opacity-50 bg-btn/30',
              )}
              onClick={() => onSelectOptionValue(value.value)}
            >
              {value.value}
            </button>
          ))}
        </div>
      )}

      {type === 'color' && (
        <div className="flex gap-4">
          {values.map((value) => {
            let swatchColor: string =
              swatches.colorSwatches.find((color) => color.name === value.value)
                ?.value || value.value;
            return (
              <button
                key={value.value}
                className={clsx(
                  defaultClassName,
                  'p-1',
                  selectedOptionValue === value.value &&
                    'border-2 border-bar/70',
                  !value.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(value.value)}
              >
                <div
                  className={clsx('w-full h-full', roundedClassName)}
                  style={{
                    backgroundColor: swatchColor,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
      {type === 'custom-image' && (
        <div className="flex gap-4">
          {values.map((value) => {
            let swatchImage: WeaverseImage =
              swatches.imageSwatches.find((image) => image.name === value.value)
                ?.value || '';
            return (
              <button
                key={value.value}
                className={clsx(
                  defaultClassName,
                  'p-0.5',
                  selectedOptionValue === value.value &&
                    'border-2 border-bar/70',
                  !value.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(value.value)}
              >
                <Image
                  data={swatchImage}
                  className={clsx(
                    'w-full h-full object-cover',
                    roundedClassName,
                  )}
                  sizes="auto"
                />
              </button>
            );
          })}
        </div>
      )}
      {type === 'variant-image' && (
        <div className="flex gap-4">
          {values.map((value) => {
            return (
              <button
                key={value.value}
                className={clsx(
                  defaultClassName,
                  selectedOptionValue === value.value &&
                    'border-2 border-bar/70',
                  !value.isAvailable && disabledClassName,
                )}
                onClick={() => onSelectOptionValue(value.value)}
              >
                <Image data={value.image} sizes="auto" />
              </button>
            );
          })}
        </div>
      )}
      {type === 'dropdown' && (
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

      {type === 'default' && (
        <div className="flex gap-4">
          {values.map((value) => (
            <div
              key={value.value}
              className={clsx(
                'leading-none py-1 cursor-pointer transition-all duration-200',
                selectedOptionValue === value.value &&
                  'border-bar/50 border-b-[1.5px]',
                !value.isAvailable && 'opacity-50',
              )}
              onClick={() => onSelectOptionValue(value.value)}
            >
              {value.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
