import clsx from 'clsx';
import {Image} from '@shopify/hydrogen'
interface VariantOptionProps {
  selectedOptionValue: string;
  onSelectOptionValue: (optionValue: string) => void;
  name: string;
  // size: string;
  type?: string;
  // shape: string;
  displayName?: string;
  swatches: {
    imageSwatches: any[]
    colorSwatches: any[]
  }
  values: {
    isActive: boolean;
    isAvailable: boolean;
    search: string;
    to: string;
    value: string;
    image?: any
  }[];
}

export function VariantOption(props: VariantOptionProps) {
  let {
    name,
    type = 'dropdown',
    values,
    displayName,
    selectedOptionValue,
    onSelectOptionValue,
    swatches
  } = props;

  let defaultClassName =
    'w-10 h-10 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
  let disabledClassName = 'diagonal';
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
                defaultClassName,
                'rounded-sm',
                selectedOptionValue === value.value &&
                  'bg-btn text-btn-content',
                !value.isAvailable && disabledClassName,
              )}
              disabled={!value.isAvailable}
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
              swatches.colorSwatches.find(
                (color) => color.name === value.value,
              )?.value || value.value;
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
                disabled={!value.isAvailable}
                onClick={() => onSelectOptionValue(value.value)}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: swatchColor,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
      {type === 'image' && (
        <div className="flex gap-4">
          {values.map((value) => {
            let swatchImage: string =
              swatches.imageSwatches.find(
                (image) => image.name === value.value,
              )?.value || '';
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
                style={{
                  backgroundImage: `url(${swatchImage})`,
                }}
                disabled={!value.isAvailable}
              ></button>
            );
          })}
        </div>
      )}
      {
        type === 'variant' && (
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
                disabled={!value.isAvailable}
              >
                <Image data={value.image} />
              </button>
              );
            })}
          </div>
        )
      }
      {type === 'dropdown' && (
        <div>
          <select
            className='min-w-[120px] w-fit rounded-sm border p-1'
            onChange={(e) => {
              onSelectOptionValue(e.target.value);
            }}
          >
            {values.map((value) => {
              return (
                <option key={value.value} value={value.value} disabled={!value.isAvailable}>
                  {value.value}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
}

// interface OptionValueProps {
//   name: string;
//   value: string;
//   type: string;
//   selected: boolean;
//   isAvailable: boolean;
// }

// function OptionValue(props: OptionValueProps) {
//   let {name, selected, value, type, isAvailable} = props;
//   let defaultClassName =
//     'w-10 h-10 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
//   let disabledClassName = 'diagonal';

//   if (type === 'button') {
//     return <button
//     key={value}
//     className={clsx(
//       defaultClassName,
//       'rounded-sm',
//       selected &&
//         'bg-btn text-btn-content',
//       isAvailable && disabledClassName,
//     )}
//     disabled={isAvailable}
//     onClick={() => onSelectOptionValue(value.value)}
//   >
//     {value.value}
//   </button>
//   }
//   return (
//     <div>
//       {type === 'button' && (
//         <div className="flex gap-4">
//           {values.map((value) => (

//           ))}
//         </div>
//       )}

//       {type === 'color' && (
//         <div className="flex gap-4">
//           {values.map((value) => {
//             let swatchColor: string = DEMO_DATA.swatches.colorSwatches.find((swatch) => swatch.name === value.value)?.value || value.value;
//             return (
//               <button
//                 key={value.value}
//                 className={clsx(
//                   defaultClassName,
//                   'p-1',
//                   selectedOptionValue === value.value &&
//                     'border-2 border-bar/70',
//                   isAvailable && disabledClassName,
//                 )}
//                 disabled={!value.isAvailable}
//                 onClick={() => onSelectOptionValue(value.value)}
//               >
//                 <div
//                   className="w-full h-full"
//                   style={{
//                     backgroundColor: swatchColor,
//                   }}
//                 />
//               </button>
//             );
//           })}
//         </div>
//       )}
//       {type === 'image' && (
//         <div>
//           {values.map((value) => {
//             let swatchImage: string = DEMO_DATA.swatches.imageSwatches.find((swatch) => swatch.name === value.value)?.value || "";
//             return <button
//               key={value.value}
//               className={clsx(
//                 defaultClassName,
//                 selectedOptionValue === value.value &&
//                 'border-2 border-bar/70',
//               )}
//               onClick={() => onSelectOptionValue(value.value)}
//               style={{
//                 backgroundImage: `url(${swatchImage})`,
//               }}
//               disabled={!value.isAvailable}
//             ></button>
//             })}
//         </div>
//       )}
//     </div>
//   )
// }
