import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import StarsRating from "react-star-rate";
import {useParentInstance} from '@weaverse/hydrogen';
import {useFetcher} from '@remix-run/react';
import { useEffect } from 'react';
import { usePrefixPathWithLocale } from '~/lib/utils';

let JudgemeReview = (props: HydrogenComponentProps) => {
  const {load, data} = useFetcher();
  let context = useParentInstance()

  let rating = Math.round((data?.rating || 0) * 100) / 100
  let handle = context.data?.product?.handle
  const api = handle && usePrefixPathWithLocale(
    `/api/review/${handle}`
  );
  useEffect( () => {
    if (api) {
      load(api)
    }
  }, [load, api])
  if (!data?.rating) return null
  return <div>
   <StarsRating style={{
    style: {
      fontSize: "16px",
    }
   }} allowClear={false} value={rating} /> ({rating})
  </div>;
};
export default JudgemeReview;



// export let loader = async (args) => {
//   let {env} = args.weaverse
//   let api_token = env.JUDGEME_PUBLIC_TOKEN
//   let shop_domain = env.PUBLIC_STORE_DOMAIN
//   console.log("🚀 ~ api_token:", env)
//   async function getInternalIdByHandle(handle: string) {
//     let api = `https://judge.me/api/v1/products/-1?` + new URLSearchParams({
//       api_token,
//       shop_domain,
//       handle: handle
//     })
//     let data = await fetch(api).then(res => res.json())
//     return data?.product?.id
//   }
//   let handle = 'adidas-classic-backpack'
//   let internalId = await getInternalIdByHandle(handle)
//   if (internalId) {
//     let data = await fetch(`https://judge.me/api/v1/reviews?`+ new URLSearchParams({
//       api_token,
//       shop_domain,
//       product_id: internalId
//     })).then(res => res.json())
//     let reviews = data.reviews
//     let rating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
//     // console.log("🚀 ~ data:", rating)
//     return {
//       rating
//     };
//   }
//   return {
//     rating: 0
//   }
// }


export let schema: HydrogenComponentSchema = {
  type: 'judgeme-review',
  title: 'Judgeme review',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Judgeme',
      inputs: [],
    },
  ],
};
