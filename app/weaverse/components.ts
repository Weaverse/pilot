import type { HydrogenComponent } from "@weaverse/hydrogen";
import * as Heading from "~/components/heading";
import * as Link from "~/components/link";
import * as Paragraph from "~/components/paragraph";
import * as SubHeading from "~/components/subheading";
import * as AllProducts from "~/sections/all-products";
import * as BlogPost from "~/sections/blog-post";
import * as Blogs from "~/sections/blogs";
import * as CollectionFilters from "~/sections/collection-filters";
import * as CollectionList from "~/sections/collection-list";
import * as CollectionListItems from "~/sections/collection-list/collections-items";
import * as ColumnsWithImages from "~/sections/columns-with-images";
import * as ColumnWithImageItem from "~/sections/columns-with-images/column";
import * as ColumnsWithImagesItems from "~/sections/columns-with-images/items";
import * as Countdown from "~/sections/countdown";
import * as CountDownTimer from "~/sections/countdown/timer";
import * as FeaturedCollections from "~/sections/featured-collections";
import * as FeaturedCollectionItems from "~/sections/featured-collections/collection-items";
import * as FeaturedProducts from "~/sections/featured-products";
import * as FeaturedProductItems from "~/sections/featured-products/product-items";
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
import * as JudgemeReview from "~/sections/judgeme-reviews";
import * as JudgemeReviewRedesigned from "~/sections/judgeme-reviews/index-redesigned";
import * as MainProduct from "~/sections/main-product";
import * as JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
import * as ProductATCButtons from "~/sections/main-product/product-atc-buttons";
import * as ProductBadges from "~/sections/main-product/product-badges";
import * as ProductBreadcrumb from "~/sections/main-product/product-breadcrumb";
import * as ProductBundledVariants from "~/sections/main-product/product-bundled-variants";
import * as ProductCollapsibleDetails from "~/sections/main-product/product-collapsible-details";
import * as ProductPrices from "~/sections/main-product/product-prices";
import * as ProductQuantitySelector from "~/sections/main-product/product-quantity-selector";
import * as ProductSummary from "~/sections/main-product/product-summary";
import * as ProductTitle from "~/sections/main-product/product-title";
import * as ProductVariantSelector from "~/sections/main-product/product-variant-selector";
import * as ProductVendor from "~/sections/main-product/product-vendor";
import * as MapSection from "~/sections/map";
import * as NewsLetter from "~/sections/newsletter";
import * as NewsLetterForm from "~/sections/newsletter/newsletter-form";
import * as OurTeam from "~/sections/our-team";
import * as OurTeamMembers from "~/sections/our-team/team-members";
import * as Page from "~/sections/page";
import * as PromotionGrid from "~/sections/promotion-grid";
import * as PromotionGridButtons from "~/sections/promotion-grid/buttons";
import * as PromotionGridItem from "~/sections/promotion-grid/item";
import * as RelatedArticles from "~/sections/related-articles";
import * as RelatedProducts from "~/sections/related-products";
import * as SingleProduct from "~/sections/single-product";
import * as SlideShow from "~/sections/slideshow";
import * as SlideShowSlide from "~/sections/slideshow/slide";
import * as Spacer from "~/sections/spacer";
import * as Testimonial from "~/sections/testimonials";
import * as TestimonialItem from "~/sections/testimonials/item";
import * as TestimonialItems from "~/sections/testimonials/items";
import * as VideoEmbed from "~/sections/video-embed";
import * as VideoEmbedItem from "~/sections/video-embed/video";

export const components: HydrogenComponent[] = [
  SubHeading,
  Heading,
  Paragraph,
  Link,
  // AliReview,
  // AliReviewList,
  AllProducts,
  FeaturedCollections,
  FeaturedCollectionItems,
  BlogPost,
  Blogs,
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
  MapSection,
  PromotionGrid,
  PromotionGridItem,
  PromotionGridButtons,
  Hotspots,
  HotspotsItem,
  Countdown,
  CountDownTimer,
  NewsLetter,
  NewsLetterForm,
  Blogs,
  BlogPost,
  AllProducts,
  FeaturedProducts,
  FeaturedProductItems,
  Testimonial,
  TestimonialItems,
  TestimonialItem,
  ImageGallery,
  ImageGalleryItems,
  ImageGalleryItem,
  MainProduct,
  ProductBreadcrumb,
  ProductBadges,
  ProductVendor,
  ProductTitle,
  ProductPrices,
  ProductSummary,
  ProductBundledVariants,
  ProductVariantSelector,
  ProductQuantitySelector,
  ProductATCButtons,
  ProductCollapsibleDetails,
  RelatedProducts,
  RelatedArticles,
  CollectionFilters,
  CollectionList,
  CollectionListItems,
  SingleProduct,
  JudgemeStarsRating,
  JudgemeReview,
  JudgemeReviewRedesigned,
  OurTeam,
  OurTeamMembers,
  SlideShow,
  SlideShowSlide,
  Spacer,
];
