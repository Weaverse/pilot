import type {HydrogenComponent} from '@weaverse/hydrogen';
import * as AllProducts from '~/sections/all-products';
import * as BlogPost from '~/sections/blog-post';
import * as Blogs from '~/sections/blogs';
import * as CollectionBanner from '~/sections/collection-banner';
import * as CollectionFilters from '~/sections/collection-filters';
import * as CollectionList from '~/sections/collection-list';
import * as ColumnWithImage from '~/sections/column-with-image';
import * as ColumnWithImageItem from '~/sections/column-with-image/item';
import * as Countdown from '~/sections/countdown';
import * as CountdownActions from '~/sections/countdown/actions';
import * as CountDownTimer from '~/sections/countdown/timer';
import * as FeaturedCollections from '~/sections/featured-collections';
import * as FeaturedProducts from '~/sections/featured-products';
import * as ImageBanner from '~/sections/image-banner';
import * as ImageGallery from '~/sections/image-gallery';
import * as ImageGalleryItem from '~/sections/image-gallery/image';
import * as ImageGalleryItems from '~/sections/image-gallery/items';
import * as ImageWithText from '~/sections/image-with-text';
import * as ImageWithTextContent from '~/sections/image-with-text/content';
import * as ImageWithTextImage from '~/sections/image-with-text/image';
import * as Map from '~/sections/map';
import * as Page from '~/sections/page';
import * as ProductInformation from '~/sections/product-information';
import * as PromotionGrid from '~/sections/promotion-grid';
import * as PromotionGridButtons from '~/sections/promotion-grid/buttons';
import * as PromotionGridItem from '~/sections/promotion-grid/item';
import * as RelatedArticles from '~/sections/related-articles';
import * as RelatedProducts from '~/sections/related-products';
import {commonComponents} from '~/sections/shared/atoms';
import * as SingleProduct from '~/sections/single-product';
import * as Judgeme from '~/components/product-form/judgeme-review';
import * as Testimonial from '~/sections/testimonials';
import * as TestimonialItem from '~/sections/testimonials/item';
import * as TestimonialItems from '~/sections/testimonials/items';
import * as VideoBanner from '~/sections/video-banner';
import * as VideoEmbed from '~/sections/video-embed';
import * as VideoEmbedItem from '~/sections/video-embed/video';
import * as MetaDemo from '~/sections/meta-demo';
import * as SlideShow from '~/sections/SlideShow/SlideShow';
import * as SlideShowItem from '~/sections/SlideShow/SlideItems';

import * as Testimonial from '~/sections/testimonial';
import * as TestimonialItem from '~/sections/testimonial/item';
import * as Video from '~/sections/video';
import * as CollectionHeader from '~/sections/collection-header';
import * as HeaderImage from '~/sections/header-image/header-image';
import * as ImageWTextSubheadingItem from '~/sections/image-with-text/content-item/subheading-item';
import * as HeadingItem from '~/sections/header-image/heading-item';
import * as SubHeadingItem from '~/sections/header-image/subheading-item';
import * as DescriptionTextItem from '~/sections/header-image/description-text-item';
import * as ButtonItem from '~/sections/header-image/button-image-item';
import * as ImageWithText from '~/sections/image-with-text/image-with-text';
import * as ImageWTextHeadingItem from '~/sections/image-with-text/content-item/heading-item';
import * as ImageWTextDescriptionItem from '~/sections/image-with-text/content-item/description-item';
import * as ImageWTextButtonItem from '~/sections/image-with-text/content-item/button-item';
import * as ContentColumnWithImage from '~/sections/column-with-text/index';
import * as ContentColumnItem from '~/sections/column-with-text/item';
import * as RichText from '~/sections/rich-text/index';
import * as RichTextHeadingItem from '~/sections/rich-text/headings-item';
import * as RichTextDescriptionItem from '~/sections/rich-text/descriptions-item';
import * as RichTextButtonItem from '~/sections/rich-text/buttons-item';
import * as VideoWithText from '~/sections/video-with-text/video-with-text';
import * as VideoSubheadingItem from '~/sections/video-with-text/video-subheading-item';
import * as VideoHeadingItem from '~/sections/video-with-text/video-heading-item';
import * as VideoDescriptionItem from '~/sections/video-with-text/video-description-item';
import * as VideoButtonItem from '~/sections/video-with-text/video-button-item';
import * as Map from '~/sections/map';
import * as PromotionGrid from '~/sections/promotion-grid/promotion-grid';
import * as PromotionGridItem from '~/sections/promotion-grid/item';
import * as Judgeme from '~/sections/judgeme-review';import * as NewsLetter from '~/sections/newsletter';

import * as Countdown from '~/sections/count-down/index';
import * as CountDownHeading from '~/sections/count-down/heading-item';
import * as CountDownSubheading from '~/sections/count-down/subheading-item';
import * as CountDownTimer from '~/sections/count-down/timer-item';
export let components: HydrogenComponent[] = [
  ...commonComponents,
  AllProducts,
  BlogPost,
  Blogs,
  CollectionBanner,
  Page,
  VideoEmbed,
  VideoEmbedItem,
  ImageBanner,
  ImageWithText,
  ImageWithTextContent,
  ImageWithTextImage,
  ColumnWithImage,
  ColumnWithImageItem,
  VideoBanner,
  Map,
  PromotionGrid,
  PromotionGridItem,
  PromotionGridButtons,
  Countdown,
  CountDownTimer,
  CountdownActions,
  NewsLetter,
  Blogs,
  BlogPost,
  AllProducts,
  FeaturedProducts,
  FeaturedCollections,
  Testimonial,
  TestimonialItems,
  TestimonialItem,
  ImageGallery,
  ImageGalleryItems,
  ImageGalleryItem,
  ProductInformation,
  RelatedProducts,
  RelatedArticles,
  CollectionFilters,
  CollectionList,
  SingleProduct,
  Judgeme,
  MetaDemo,
  SlideShow,
  SlideShowItem,
];
