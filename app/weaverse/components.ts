import type { HydrogenComponent } from "@weaverse/hydrogen";

import { sharedComponents } from "~/components";
import * as Judgeme from "~/modules/product-form/judgeme-review";
import * as SlideShowItem from "~/sections/SlideShow/SlideItems";
import * as SlideShow from "~/sections/SlideShow/SlideShow";
import * as AliReview from "~/sections/ali-reviews";
import * as AliReviewList from "~/sections/ali-reviews/review-list";
import * as AllProducts from "~/sections/all-products";
import * as BlogPost from "~/sections/blog-post";
import * as Blogs from "~/sections/blogs";
import * as CollectionBanner from "~/sections/collection-banner";
import * as CollectionFilters from "~/sections/collection-filters";
import * as CollectionList from "~/sections/collection-list";
import * as ColumnsWithImages from "~/sections/columns-with-images";
import * as ColumnWithImageItem from "~/sections/columns-with-images/column";
import * as ColumnsWithImagesItems from "~/sections/columns-with-images/items";
import * as ContactForm from "~/sections/contact-form";
import * as Countdown from "~/sections/countdown";
import * as CountDownTimer from "~/sections/countdown/timer";
import * as FeaturedCollections from "~/sections/featured-collections";
import * as FeaturedProducts from "~/sections/featured-products";
import * as HeroImage from "~/sections/hero-image";
import * as HeroVideo from "~/sections/hero-video";
import * as Hotspots from "~/sections/hotspots";
import * as HotspotsItem from "~/sections/hotspots/item";
import * as ImageGallery from "~/sections/image-gallery";
import * as ImageGalleryItem from "~/sections/image-gallery/image";
import * as ImageGalleryItems from "~/sections/image-gallery/items";
import * as ImageWithText from "~/sections/image-with-text";
import * as ImageWithTextContent from "~/sections/image-with-text/content";
import * as ImageWithTextImage from "~/sections/image-with-text/image";
import * as Map from "~/sections/map";
import * as MetaDemo from "~/sections/meta-demo";
import * as NewsLetter from "~/sections/newsletter";
import * as Page from "~/sections/page";
import * as ProductInformation from "~/sections/product-information";
import * as ProductList from "~/sections/product-list";
import * as PromotionGrid from "~/sections/promotion-grid";
import * as PromotionGridButtons from "~/sections/promotion-grid/buttons";
import * as PromotionGridItem from "~/sections/promotion-grid/item";
import * as RelatedArticles from "~/sections/related-articles";
import * as RelatedProducts from "~/sections/related-products";
import * as SingleProduct from "~/sections/single-product";
import * as Spacer from "~/sections/spacer";
import * as Testimonial from "~/sections/testimonials";
import * as TestimonialItem from "~/sections/testimonials/item";
import * as TestimonialItems from "~/sections/testimonials/items";
import * as UserProfiles from "~/sections/user-profiles";
import * as VideoEmbed from "~/sections/video-embed";
import * as VideoEmbedItem from "~/sections/video-embed/video";

export let components: HydrogenComponent[] = [
  ...sharedComponents,
  AliReview,
  AliReviewList,
  AllProducts,
  BlogPost,
  Blogs,
  CollectionBanner,
  Page,
  VideoEmbed,
  VideoEmbedItem,
  HeroImage,
  ImageWithText,
  ImageWithTextContent,
  ImageWithTextImage,
  ColumnsWithImages,
  ColumnsWithImagesItems,
  ColumnWithImageItem,
  HeroVideo,
  Map,
  PromotionGrid,
  PromotionGridItem,
  PromotionGridButtons,
  Hotspots,
  HotspotsItem,
  Countdown,
  CountDownTimer,
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
  Spacer,
];
