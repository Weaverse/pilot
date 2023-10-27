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
import * as ImageWithText from '~/sections/image-with-text/image-with-text';
import * as ImageWTextHeadingItem from '~/sections/image-with-text/content-item/heading-item';
import * as ImageWTextDescriptionItem from '~/sections/image-with-text/content-item/description-item';
import * as ImageWTextButtonItem from '~/sections/image-with-text/content-item/button-item';
import * as ImageComponent from '~/sections/image-with-text/images-item/images';
import * as ImageItems from '~/sections/image-with-text/images-item/item';
import * as ContentComponent from '~/sections/image-with-text/content-item/index';
import * as ContentColumnWithImage from '~/sections/column-with-text/index';
import * as ContentColumnItem from '~/sections/column-with-text/item';
import * as RichText from '~/sections/rich-text/index';
import * as RichTextHeadingItem from '~/sections/rich-text/headings-item';
import * as RichTextDescriptionItem from '~/sections/rich-text/descriptions-item';
import * as RichTextButtonItem from '~/sections/rich-text/buttons-item';
import * as Map from '~/sections/map';
import * as NewsLetter from '~/sections/news-letter';

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
  ImageWithText,
  ContentComponent,
  ImageWTextHeadingItem,
  ImageWTextDescriptionItem,
  ImageWTextButtonItem,
  ImageComponent,
  ImageItems,
  ContentColumnWithImage,
  ContentColumnItem,
  RichText,
  RichTextHeadingItem,
  RichTextDescriptionItem,
  RichTextButtonItem,
  Map,
  NewsLetter,
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
