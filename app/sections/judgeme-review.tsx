import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import StarsRating from 'react-star-rate';
import {useParentInstance} from '@weaverse/hydrogen';
import {useFetcher} from '@remix-run/react';
import {forwardRef, useEffect} from 'react';
import {usePrefixPathWithLocale} from '~/lib/utils';

let JudgemeReview = forwardRef<HTMLDivElement, HydrogenComponentProps>(
  (props, ref) => {
    const {load, data} = useFetcher<{
      rating: number;
      reviewNumber: number;
      error?: string;
    }>();
    let context = useParentInstance();
    let handle = context?.data?.product?.handle!;
    const api = handle && usePrefixPathWithLocale(`/api/review/${handle}`);
    useEffect(() => {
      if (api) {
        load(api);
      }
    }, [load, api]);
    if (!data) return null
    if (data.error) return <div {...props} ref={ref}>{data.error}</div>;
    let rating = Math.round((data.rating || 0) * 100) / 100;
    let reviewNumber = data.reviewNumber || 0;
    return (
      <div {...props} ref={ref}>
        <StarsRating
          style={{
            style: {
              fontSize: '16px',
            },
          }}
          allowClear={false}
          value={rating}
        />{' '}
        ({reviewNumber})
      </div>
    );
  },
);
export default JudgemeReview;

export let schema: HydrogenComponentSchema = {
  type: 'judgeme',
  title: 'Judgeme review',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Judgeme',
      inputs: [],
    },
  ],
};
