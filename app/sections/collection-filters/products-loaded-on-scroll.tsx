import {useNavigate} from '@remix-run/react';
import {useEffect} from 'react';
import {Grid, ProductCard} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';

type ProductsLoadedOnScrollProps = {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
};

export function ProductsLoadedOnScroll(props: ProductsLoadedOnScrollProps) {
  let {nodes, inView, nextPageUrl, hasNextPage, state} = props;
  let navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <Grid layout="products">
      {nodes.map((product: any, i: number) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={getImageLoadingPriority(i)}
        />
      ))}
    </Grid>
  );
}
