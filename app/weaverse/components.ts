import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as CollectionFilters from '~/sections/collection-filters';
import * as CollectionList from '~/sections/collection-list';
import * as FeaturedCollections from '~/sections/featured-collections';
import * as FeaturedProducts from '~/sections/featured-products';
import * as Hero from '~/sections/hero';
import * as Cart from '~/sections/cart';
import * as ImageGallery from '~/sections/image-gallery';
import * as ImageGalleryItem from '~/sections/image-gallery/image';
import * as Main from '~/sections/main';
import * as Search from '~/sections/search';
import * as ProductInformation from '~/sections/product-information';
import * as RecommendedProducts from '~/sections/recommended-products';
import * as Testimonial from '~/sections/testimonial';
import * as TestimonialItem from '~/sections/testimonial/item';
import * as CustomerLogin from '~/sections/customer/login';
import * as CustomerRegister from '~/sections/customer/register';
import * as Page from '~/sections/page';
import * as Blogs from '~/sections/blogs';
import * as BlogPost from '~/sections/blog-post';

export let components: HydrogenComponent[] = [
  Main,
  Cart,
  Hero,
  Page,
  Search,
  Blogs,
  BlogPost,
  FeaturedProducts,
  FeaturedCollections,
  Testimonial,
  TestimonialItem,
  ImageGallery,
  ImageGalleryItem,
  ProductInformation,
  RecommendedProducts,
  CollectionFilters,
  CollectionList,
  CustomerLogin,
  CustomerRegister,
];
