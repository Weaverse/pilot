import {Listbox} from '@headlessui/react';
import {VariantSelector} from '@shopify/hydrogen';
import clsx from 'clsx';
import {useRef} from 'react';
import {
  ProductQuery,
  ProductVariantFragmentFragment,
} from 'storefrontapi.generated';
import {Heading, IconCaret, IconCheck, Link} from '~/components';

interface ProductVariantsProps {
  selectedVariant: ProductVariantFragmentFragment;
  onSelectedVariantChange: (variant: ProductVariantFragmentFragment) => void;
  variants: {
    nodes: ProductVariantFragmentFragment[];
  };
  handle: string;
  product: NonNullable<ProductQuery['product']>;
  options: NonNullable<ProductQuery['product']>['options'];
}
export function ProductVariants(props: ProductVariantsProps) {
  let {selectedVariant, onSelectedVariantChange, options, variants, handle} =
    props;
  const closeRef = useRef<HTMLButtonElement>(null);
  let selectedOptions = selectedVariant?.selectedOptions;
  let nodes = variants?.nodes;
  let handleSelectOption = (optionName: string, value: string) => {
    let newSelectedOptions = selectedOptions?.map((opt) => {
      if (opt.name === optionName) {
        return {
          ...opt,
          value,
        };
      }
      return opt;
    });
    let newSelectedVariant = nodes?.find((variant) => {
      let variantOptions = variant.selectedOptions;
      let isMatch = true;
      for (let i = 0; i < variantOptions.length; i++) {
        if (variantOptions[i].value !== newSelectedOptions?.[i].value) {
          isMatch = false;
          break;
        }
      }
      return isMatch;
    });
    if (newSelectedVariant) {
      onSelectedVariantChange(newSelectedVariant);
    }
  };
  return (
    <div>
      <VariantSelector
        handle={handle}
        variants={nodes}
        options={options}
        productPath=""
      >
        {({option}) => {
          let optionName = option.name;
          let selectedValue = selectedOptions?.find(
            (opt) => opt.name === optionName,
          )?.value;
          return (
            <div
              key={option.name}
              className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
            >
              <Heading as="legend" size="lead" className="min-w-[4rem]">
                {option.name}
              </Heading>
              <div className="flex flex-wrap items-baseline gap-4">
                {option.values.length > 7 ? (
                  <div className="relative w-full">
                    <Listbox>
                      {({open}) => (
                        <>
                          <Listbox.Button
                            ref={closeRef}
                            className={clsx(
                              'flex items-center justify-between w-full py-3 px-4 border border-bar',
                              open
                                ? 'rounded-b md:rounded-t md:rounded-b-none'
                                : 'rounded',
                            )}
                          >
                            <span>{option.value}</span>
                            <IconCaret direction={open ? 'up' : 'down'} />
                          </Listbox.Button>
                          <Listbox.Options
                            className={clsx(
                              'border-bar bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                              open ? 'max-h-48' : 'max-h-0',
                            )}
                          >
                            {option.values
                              .filter((value) => value.isAvailable)
                              .map(({value, to, isActive}) => (
                                <Listbox.Option
                                  key={`option-${option.name}-${value}`}
                                  value={value}
                                >
                                  {({active}) => (
                                    <Link
                                      to={to}
                                      className={clsx(
                                        'text-body w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                        active && 'bg-primary/10',
                                      )}
                                      onClick={() => {
                                        if (!closeRef?.current) return;
                                        closeRef.current.click();
                                      }}
                                    >
                                      {value}
                                      {isActive && (
                                        <span className="ml-2">
                                          <IconCheck />
                                        </span>
                                      )}
                                    </Link>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </>
                      )}
                    </Listbox>
                  </div>
                ) : (
                  option.values.map(({value, isAvailable, to}) => (
                    <Link
                      key={option.name + value}
                      to={'/'}
                      preventScrollReset
                      prefetch="intent"
                      replace
                      className={clsx(
                        'leading-none py-1 cursor-pointer transition-all duration-200',
                        selectedValue === value &&
                          'border-bar/50 border-b-[1.5px]',
                        isAvailable ? 'opacity-100' : 'opacity-50',
                      )}
                      onClick={() => {
                        handleSelectOption(optionName, value);
                      }}
                    >
                      {value}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        }}
      </VariantSelector>
    </div>
  );
}
