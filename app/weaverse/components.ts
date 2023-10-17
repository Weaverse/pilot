import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as AllProducts from '~/sections/all-products';
import * as BlogPost from '~/sections/blog-post';
import * as Blogs from '~/sections/blogs';
import * as CollectionFilters from '~/sections/collection-filters';
import * as CollectionList from '~/sections/collection-list';
import * as FeaturedCollections from '~/sections/featured-collections';
import * as FeaturedProducts from '~/sections/featured-products';
import * as Hero from '~/sections/hero';
import * as ImageGallery from '~/sections/image-gallery';
import * as ImageGalleryItem from '~/sections/image-gallery/image';
import * as Main from '~/sections/main';
import * as Page from '~/sections/page';
import * as ProductInformation from '~/sections/product-information';
import * as RelatedArticles from '~/sections/related-articles';
import * as RelatedProducts from '~/sections/related-products';
import * as SingleProduct from '~/sections/single-product';
import * as Testimonial from '~/sections/testimonial';
import * as TestimonialItem from '~/sections/testimonial/item';
import * as Video from '~/sections/video';
import * as CollectionHeader from '~/sections/collection-header';
import * as HeaderImage from '~/sections/header-image/header-image';
import * as HeadingItem from '~/sections/header-image/heading-item';
import * as SubHeadingItem from '~/sections/header-image/subheading-item';
import * as DescriptionTextItem from '~/sections/header-image/description-text-item';
import * as ContentColumnWithImage from '~/sections/content-column-with-image/index';
import * as ContentColumnItem from '~/sections/content-column-with-image/item';

export let components: HydrogenComponent[] = [
  Main,
  Hero,
  Page,
  Video,
  CollectionHeader,
  HeaderImage,
  HeadingItem,
  SubHeadingItem,
  DescriptionTextItem,
  ContentColumnWithImage,
  ContentColumnItem,
  Blogs,
  BlogPost,
  AllProducts,
  FeaturedProducts,
  FeaturedCollections,
  Testimonial,
  TestimonialItem,
  ImageGallery,
  ImageGalleryItem,
  ProductInformation,
  RelatedProducts,
  RelatedArticles,
  CollectionFilters,
  CollectionList,
  SingleProduct,
];
