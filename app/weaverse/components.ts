import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as AllProducts from '~/sections/all-products';
import * as BlogPost from '~/sections/blog-post';
import * as Blogs from '~/sections/blogs';
import * as CollectionFilters from '~/sections/collection-filters';
import * as CollectionHeader from '~/sections/collection-header';
import * as CollectionList from '~/sections/collection-list';
import * as ContentColumnWithImage from '~/sections/column-with-text/index';
import * as ContentColumnItem from '~/sections/column-with-text/item';
import * as CountDownHeading from '~/sections/count-down/heading-item';
import * as Countdown from '~/sections/count-down/index';
import * as CountDownSubheading from '~/sections/count-down/subheading-item';
import * as CountDownTimer from '~/sections/count-down/timer-item';
import * as FeaturedCollections from '~/sections/featured-collections';
import * as FeaturedProducts from '~/sections/featured-products';
import * as ButtonItem from '~/sections/HeaderImage/ButtonImage';
import * as HeaderImage from '~/sections/HeaderImage/HeaderImage';
import * as Hero from '~/sections/hero';
import * as ImageGallery from '~/sections/image-gallery';
import * as ImageGalleryItem from '~/sections/image-gallery/image';
import * as ImageWTextButtonItem from '~/sections/image-with-text/content-item/ButtonItem';
import * as ImageWithText from '~/sections/image-with-text/ImageWithText';
import * as Judgeme from '~/sections/judgeme-review';
import * as Main from '~/sections/main';
import * as Map from '~/sections/map';
import * as Page from '~/sections/page';
import * as ProductInformation from '~/sections/product-information';
import * as PromotionGridItem from '~/sections/promotion-grid/item';
import * as PromotionGrid from '~/sections/promotion-grid/promotion-grid';
import * as RelatedArticles from '~/sections/related-articles';
import * as RelatedProducts from '~/sections/related-products';
import * as RichTextButtonItem from '~/sections/RichText/Button';
import * as RichText from '~/sections/RichText/RichText';
import {atoms} from '~/sections/shared/atoms';
import * as SingleProduct from '~/sections/single-product';
import * as Testimonial from '~/sections/testimonials';
import * as TestimonialItems from '~/sections/testimonials/items';
import * as TestimonialItem from '~/sections/testimonials/item';
import * as Video from '~/sections/video';
import * as VideoButtonItem from '~/sections/VideoWithText/video-button-item';
import * as VideoWithText from '~/sections/VideoWithText/VideoWithText';

export let components: HydrogenComponent[] = [
  ...atoms,
  Main,
  Hero,
  Page,
  Video,
  CollectionHeader,
  HeaderImage,
  ButtonItem,
  ImageWithText,
  ImageWTextButtonItem,
  ContentColumnWithImage,
  ContentColumnItem,
  RichText,
  RichTextButtonItem,
  VideoWithText,
  VideoButtonItem,
  Map,
  PromotionGrid,
  PromotionGridItem,
  Countdown,
  CountDownHeading,
  CountDownSubheading,
  CountDownTimer,
  Blogs,
  BlogPost,
  AllProducts,
  FeaturedProducts,
  FeaturedCollections,
  Testimonial,
  TestimonialItems,
  TestimonialItem,
  ImageGallery,
  ImageGalleryItem,
  ProductInformation,
  RelatedProducts,
  RelatedArticles,
  CollectionFilters,
  CollectionList,
  SingleProduct,
  Judgeme,
];
