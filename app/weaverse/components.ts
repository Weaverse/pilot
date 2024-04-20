import type {HydrogenComponent} from '@weaverse/hydrogen';

import * as AllProducts from '~/sections/all-products';
import * as BlogPost from '~/sections/blog-post';
import * as Blogs from '~/sections/blogs';
import * as CollectionBanner from '~/sections/collection-banner';
import * as CollectionFilters from '~/sections/collection-filters';
import * as CollectionList from '~/sections/collection-list';
import * as ColumnsWithImages from '~/sections/columns-with-images';
import * as ColumnsWithImagesItems from '~/sections/columns-with-images/items';
import * as ColumnWithImageItem from '~/sections/columns-with-images/column';
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
import * as VideoHero from '~/sections/video-hero';
import * as VideoEmbed from '~/sections/video-embed';
import * as VideoEmbedItem from '~/sections/video-embed/video';
import * as MetaDemo from '~/sections/meta-demo';
import * as SlideShow from '~/sections/SlideShow/SlideShow';
import * as SlideShowItem from '~/sections/SlideShow/SlideItems';
import * as NewsLetter from '~/sections/newsletter';
import * as ImageHotspot from '~/sections/image-hotspots/image-hotspot';
import * as ImageHotspotItem from '~/sections/image-hotspots/items';
import * as ProductList from '~/sections/product-list';
import * as ContactForm from '~/sections/contact-form';
import * as UserProfiles from '~/sections/user-profiles';

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
  ColumnsWithImages,
  ColumnsWithImagesItems,
  ColumnWithImageItem,
  VideoHero,
  Map,
  PromotionGrid,
  PromotionGridItem,
  PromotionGridButtons,
  ImageHotspot,
  ImageHotspotItem,
  Countdown,
  CountDownTimer,
  CountdownActions,
  NewsLetter,
  UserProfiles,
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
  ProductList,
  ContactForm,
];
