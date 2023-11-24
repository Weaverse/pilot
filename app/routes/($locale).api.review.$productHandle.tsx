import {type RouteLoaderArgs} from '@weaverse/hydrogen';
import invariant from 'tiny-invariant';

type JudgemeProductData = {
  product: {
    id: string;
    handle: string;
  };
};

type JudgemeReviewsData = {
  reviews: {
    rating: number;
  }[];
};

async function getInternalIdByHandle(
  api_token: string,
  shop_domain: string,
  handle: string,
) {
  let api =
    `https://judge.me/api/v1/products/-1?` +
    new URLSearchParams({
      api_token,
      shop_domain,
      handle: handle,
    });
  let data = (await fetch(api).then((res) => res.json())) as JudgemeProductData;
  return data?.product?.id;
}

export async function loader(args: RouteLoaderArgs) {
  let {params, context} = args;
  let env = context.env;
  let handle = params.productHandle;
  let api_token = env.JUDGEME_PUBLIC_TOKEN;
  let shop_domain = env.PUBLIC_STORE_DOMAIN;
  invariant(handle, 'Missing product handle');
  if (!api_token)
    return {
      error: 'Missing JUDGEME_PUBLIC_TOKEN',
    };
  let internalId = await getInternalIdByHandle(api_token, shop_domain, handle);
  if (internalId) {
    let data = (await fetch(
      `https://judge.me/api/v1/reviews?` +
        new URLSearchParams({
          api_token,
          shop_domain,
          product_id: internalId,
        }),
    ).then((res) => res.json())) as JudgemeReviewsData;
    let reviews = data.reviews;
    let rating =
      reviews.reduce((acc, review) => acc + review.rating, 0) /
      (reviews.length || 1);
    return {
      rating,
      reviewNumber: reviews.length,
    };
  }
  return {
    rating: 0,
  };
}
