/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  | 'id'
  | 'availableForSale'
  | 'quantityAvailable'
  | 'sku'
  | 'title'
  | 'requiresComponents'
> & {
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  components: {
    nodes: Array<
      Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
        productVariant: Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
          product: Pick<StorefrontAPI.Product, 'handle'>;
        };
      }
    >;
  };
  groupedBy: {
    nodes: Array<
      Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
        product: Pick<StorefrontAPI.Product, 'handle'>;
      }
    >;
  };
};

export type ProductOptionFragment = Pick<
  StorefrontAPI.ProductOption,
  'name'
> & {
  optionValues: Array<
    Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
      firstSelectableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          | 'id'
          | 'availableForSale'
          | 'quantityAvailable'
          | 'sku'
          | 'title'
          | 'requiresComponents'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          components: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                productVariant: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'title'
                > & {product: Pick<StorefrontAPI.Product, 'handle'>};
              }
            >;
          };
          groupedBy: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                product: Pick<StorefrontAPI.Product, 'handle'>;
              }
            >;
          };
        }
      >;
      swatch?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
          image?: StorefrontAPI.Maybe<{
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText'>
            >;
          }>;
        }
      >;
    }
  >;
};

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
> & {
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              | 'id'
              | 'availableForSale'
              | 'quantityAvailable'
              | 'sku'
              | 'title'
              | 'requiresComponents'
            > & {
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
              components: {
                nodes: Array<
                  Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                    productVariant: Pick<
                      StorefrontAPI.ProductVariant,
                      'id' | 'title'
                    > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                  }
                >;
              };
              groupedBy: {
                nodes: Array<
                  Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                    product: Pick<StorefrontAPI.Product, 'handle'>;
                  }
                >;
              };
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url' | 'altText'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
  badges: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
    >
  >;
  priceRange: {
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      | 'id'
      | 'availableForSale'
      | 'quantityAvailable'
      | 'sku'
      | 'title'
      | 'requiresComponents'
    > & {
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      components: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
            productVariant: Pick<
              StorefrontAPI.ProductVariant,
              'id' | 'title'
            > & {product: Pick<StorefrontAPI.Product, 'handle'>};
          }
        >;
      };
      groupedBy: {
        nodes: Array<
          Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
            product: Pick<StorefrontAPI.Product, 'handle'>;
          }
        >;
      };
    }
  >;
  isBundle?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
  >;
};

type Media_ExternalVideo_Fragment = {__typename: 'ExternalVideo'} & Pick<
  StorefrontAPI.ExternalVideo,
  'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
> & {
    previewImage?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };

type Media_MediaImage_Fragment = {__typename: 'MediaImage'} & Pick<
  StorefrontAPI.MediaImage,
  'id' | 'mediaContentType' | 'alt'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
    >;
    previewImage?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };

type Media_Model3d_Fragment = {__typename: 'Model3d'} & Pick<
  StorefrontAPI.Model3d,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };

type Media_Video_Fragment = {__typename: 'Video'} & Pick<
  StorefrontAPI.Video,
  'id' | 'mediaContentType' | 'alt'
> & {
    sources: Array<Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>>;
    previewImage?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type MediaFragment =
  | Media_ExternalVideo_Fragment
  | Media_MediaImage_Fragment
  | Media_Model3d_Fragment
  | Media_Video_Fragment;

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'publishedAt'
      | 'descriptionHtml'
      | 'description'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
      | 'tags'
    > & {summary: StorefrontAPI.Product['description']} & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText'>
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      badges: Array<
        StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
        >
      >;
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  | 'id'
                  | 'availableForSale'
                  | 'quantityAvailable'
                  | 'sku'
                  | 'title'
                  | 'requiresComponents'
                > & {
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  components: {
                    nodes: Array<
                      Pick<
                        StorefrontAPI.ProductVariantComponent,
                        'quantity'
                      > & {
                        productVariant: Pick<
                          StorefrontAPI.ProductVariant,
                          'id' | 'title'
                        > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                      }
                    >;
                  };
                  groupedBy: {
                    nodes: Array<
                      Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                        product: Pick<StorefrontAPI.Product, 'handle'>;
                      }
                    >;
                  };
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<{
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url' | 'altText'>
                    >;
                  }>;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          | 'id'
          | 'availableForSale'
          | 'quantityAvailable'
          | 'sku'
          | 'title'
          | 'requiresComponents'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          components: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                productVariant: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'title'
                > & {product: Pick<StorefrontAPI.Product, 'handle'>};
              }
            >;
          };
          groupedBy: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                product: Pick<StorefrontAPI.Product, 'handle'>;
              }
            >;
          };
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          | 'id'
          | 'availableForSale'
          | 'quantityAvailable'
          | 'sku'
          | 'title'
          | 'requiresComponents'
        > & {
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          components: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                productVariant: Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'title'
                > & {product: Pick<StorefrontAPI.Product, 'handle'>};
              }
            >;
          };
          groupedBy: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                product: Pick<StorefrontAPI.Product, 'handle'>;
              }
            >;
          };
        }
      >;
      isBundle?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.ProductVariant, 'requiresComponents'> & {
          components: {
            nodes: Array<
              Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                productVariant: Pick<
                  StorefrontAPI.ProductVariant,
                  | 'id'
                  | 'availableForSale'
                  | 'quantityAvailable'
                  | 'sku'
                  | 'title'
                  | 'requiresComponents'
                > & {
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  components: {
                    nodes: Array<
                      Pick<
                        StorefrontAPI.ProductVariantComponent,
                        'quantity'
                      > & {
                        productVariant: Pick<
                          StorefrontAPI.ProductVariant,
                          'id' | 'title'
                        > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                      }
                    >;
                  };
                  groupedBy: {
                    nodes: Array<
                      Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                        product: Pick<StorefrontAPI.Product, 'handle'>;
                      }
                    >;
                  };
                };
              }
            >;
          };
          groupedBy: {nodes: Array<Pick<StorefrontAPI.ProductVariant, 'id'>>};
        }
      >;
      media: {
        nodes: Array<
          | ({__typename: 'ExternalVideo'} & Pick<
              StorefrontAPI.ExternalVideo,
              'id' | 'embedUrl' | 'host' | 'mediaContentType' | 'alt'
            > & {
                previewImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'mediaContentType' | 'alt'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'mediaContentType' | 'alt'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'mimeType' | 'url'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
              })
        >;
      };
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
  };
};

export type GetShopPrimaryDomainQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetShopPrimaryDomainQuery = {
  shop: {primaryDomain: Pick<StorefrontAPI.Domain, 'url'>};
};

export type ShopQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopQuery = {
  shop: Pick<StorefrontAPI.Shop, 'name' | 'description'>;
};

export type CustomerCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerCreateInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'firstName' | 'lastName' | 'email' | 'phone' | 'acceptsMarketing'
      >
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'field' | 'message' | 'code'>
    >;
  }>;
};

export type FeaturedItemsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  pageBy?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type FeaturedItemsQuery = {
  featuredProducts: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
  };
};

export type PredictiveArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    blog: Pick<StorefrontAPI.Blog, 'handle'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictiveCollectionFragment = {__typename: 'Collection'} & Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictivePageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'id' | 'title' | 'handle' | 'trackingParameters'
>;

export type PredictiveProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'trackingParameters' | 'vendor'
> & {
    featuredImage?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      }
    >;
  };

export type PredictiveQueryFragment = {
  __typename: 'SearchQuerySuggestion';
} & Pick<
  StorefrontAPI.SearchQuerySuggestion,
  'text' | 'styledText' | 'trackingParameters'
>;

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  limit: StorefrontAPI.Scalars['Int']['input'];
  limitScope: StorefrontAPI.PredictiveSearchLimitScope;
  searchTerm: StorefrontAPI.Scalars['String']['input'];
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    articles: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          blog: Pick<StorefrontAPI.Blog, 'handle'>;
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    collections: Array<
      {__typename: 'Collection'} & Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    pages: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'id' | 'title' | 'handle' | 'trackingParameters'
      >
    >;
    products: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'trackingParameters' | 'vendor'
      > & {
          featuredImage?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
            }
          >;
        }
    >;
    queries: Array<
      {__typename: 'SearchQuerySuggestion'} & Pick<
        StorefrontAPI.SearchQuerySuggestion,
        'text' | 'styledText' | 'trackingParameters'
      >
    >;
  }>;
};

export type ApiAllProductsQueryVariables = StorefrontAPI.Exact<{
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductSortKeys>;
}>;

export type ApiAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
  };
};

export type ArticleQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  articleHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ArticleQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
      articleByHandle?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Article,
          'title' | 'handle' | 'contentHtml' | 'publishedAt' | 'tags'
        > & {
          author?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ArticleAuthor, 'name'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'altText' | 'url' | 'width' | 'height'
            >
          >;
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
        }
      >;
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            | 'contentHtml'
            | 'excerpt'
            | 'excerptHtml'
            | 'handle'
            | 'id'
            | 'publishedAt'
            | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
          }
        >;
      };
    }
  >;
};

export type ArticleFragment = Pick<
  StorefrontAPI.Article,
  | 'contentHtml'
  | 'excerpt'
  | 'excerptHtml'
  | 'handle'
  | 'id'
  | 'publishedAt'
  | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  pageBy: StorefrontAPI.Scalars['Int']['input'];
  cursor?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Article,
            | 'contentHtml'
            | 'excerpt'
            | 'excerptHtml'
            | 'handle'
            | 'id'
            | 'publishedAt'
            | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
          };
        }>;
      };
    }
  >;
};

export type CollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey: StorefrontAPI.ProductCollectionSortKeys;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  customBannerNamespace: StorefrontAPI.Scalars['String']['input'];
  customBannerKey: StorefrontAPI.Scalars['String']['input'];
}>;

export type CollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      metafield?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Metafield,
          'id' | 'type' | 'description' | 'value'
        > & {
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'id' | 'url'>
            >;
          }>;
        }
      >;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      products: {
        filters: Array<
          Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
          > & {
            images: {
              nodes: Array<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            };
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                    firstSelectableVariant?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.ProductVariant,
                        | 'id'
                        | 'availableForSale'
                        | 'quantityAvailable'
                        | 'sku'
                        | 'title'
                        | 'requiresComponents'
                      > & {
                        selectedOptions: Array<
                          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                        >;
                        image?: StorefrontAPI.Maybe<
                          Pick<
                            StorefrontAPI.Image,
                            'id' | 'url' | 'altText' | 'width' | 'height'
                          >
                        >;
                        price: Pick<
                          StorefrontAPI.MoneyV2,
                          'amount' | 'currencyCode'
                        >;
                        compareAtPrice?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                        >;
                        unitPrice?: StorefrontAPI.Maybe<
                          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                        >;
                        product: Pick<
                          StorefrontAPI.Product,
                          'title' | 'handle'
                        >;
                        components: {
                          nodes: Array<
                            Pick<
                              StorefrontAPI.ProductVariantComponent,
                              'quantity'
                            > & {
                              productVariant: Pick<
                                StorefrontAPI.ProductVariant,
                                'id' | 'title'
                              > & {
                                product: Pick<StorefrontAPI.Product, 'handle'>;
                              };
                            }
                          >;
                        };
                        groupedBy: {
                          nodes: Array<
                            Pick<
                              StorefrontAPI.ProductVariant,
                              'id' | 'title'
                            > & {product: Pick<StorefrontAPI.Product, 'handle'>}
                          >;
                        };
                      }
                    >;
                    swatch?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                        image?: StorefrontAPI.Maybe<{
                          previewImage?: StorefrontAPI.Maybe<
                            Pick<StorefrontAPI.Image, 'url' | 'altText'>
                          >;
                        }>;
                      }
                    >;
                  }
                >;
              }
            >;
            badges: Array<
              StorefrontAPI.Maybe<
                Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
              >
            >;
            priceRange: {
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.ProductVariant,
                | 'id'
                | 'availableForSale'
                | 'quantityAvailable'
                | 'sku'
                | 'title'
                | 'requiresComponents'
              > & {
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                unitPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                components: {
                  nodes: Array<
                    Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                      productVariant: Pick<
                        StorefrontAPI.ProductVariant,
                        'id' | 'title'
                      > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                    }
                  >;
                };
                groupedBy: {
                  nodes: Array<
                    Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                      product: Pick<StorefrontAPI.Product, 'handle'>;
                    }
                  >;
                };
              }
            >;
            isBundle?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
            >;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
      highestPriceProduct: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          }
        >;
      };
      lowestPriceProduct: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          }
        >;
      };
    }
  >;
  collections: {
    edges: Array<{node: Pick<StorefrontAPI.Collection, 'title' | 'handle'>}>;
  };
};

export type CollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'description' | 'handle'
      > & {
        seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'width' | 'height' | 'altText'
          >
        >;
        products: {
          nodes: Array<
            Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
              media: {
                nodes: Array<{
                  previewImage?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'width' | 'height' | 'altText'
                    >
                  >;
                }>;
              };
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PageDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageDetailsQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'handle' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyHandleFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PoliciesHandleQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PoliciesHandleQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyIndexFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesIndexQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type PoliciesIndexQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type AllProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type AllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type SearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  searchTerm?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type SearchQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'startCursor' | 'endCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
};

export type StoreRobotsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StoreRobotsQuery = {shop: Pick<StorefrontAPI.Shop, 'id'>};

export type CollectionsByIdsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type CollectionsByIdsQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'onlineStoreUrl' | 'description'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'width' | 'height' | 'url'
          >
        >;
      }
    >
  >;
};

export type FeaturedProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type FeaturedProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
  };
};

export type OurTeamQueryVariables = StorefrontAPI.Exact<{
  type: StorefrontAPI.Scalars['String']['input'];
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
}>;

export type OurTeamQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'handle' | 'id' | 'type'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'type' | 'value'> & {
            reference?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MediaImage, 'alt'> & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'url' | 'width' | 'height'
                  >
                >;
              }
            >;
          }
        >;
      }
    >;
  };
};

export type ProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  productId: StorefrontAPI.Scalars['ID']['input'];
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
}>;

export type ProductRecommendationsQuery = {
  recommended?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >
  >;
  additional: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'publishedAt' | 'handle' | 'vendor' | 'tags'
      > & {
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<
              Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
                firstSelectableVariant?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.ProductVariant,
                    | 'id'
                    | 'availableForSale'
                    | 'quantityAvailable'
                    | 'sku'
                    | 'title'
                    | 'requiresComponents'
                  > & {
                    selectedOptions: Array<
                      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                    >;
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'id' | 'url' | 'altText' | 'width' | 'height'
                      >
                    >;
                    price: Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >;
                    compareAtPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    unitPrice?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                    >;
                    product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                    components: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.ProductVariantComponent,
                          'quantity'
                        > & {
                          productVariant: Pick<
                            StorefrontAPI.ProductVariant,
                            'id' | 'title'
                          > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                        }
                      >;
                    };
                    groupedBy: {
                      nodes: Array<
                        Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                          product: Pick<StorefrontAPI.Product, 'handle'>;
                        }
                      >;
                    };
                  }
                >;
                swatch?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                    image?: StorefrontAPI.Maybe<{
                      previewImage?: StorefrontAPI.Maybe<
                        Pick<StorefrontAPI.Image, 'url' | 'altText'>
                      >;
                    }>;
                  }
                >;
              }
            >;
          }
        >;
        badges: Array<
          StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'key' | 'namespace' | 'value'>
          >
        >;
        priceRange: {
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'quantityAvailable'
            | 'sku'
            | 'title'
            | 'requiresComponents'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
            groupedBy: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
                  product: Pick<StorefrontAPI.Product, 'handle'>;
                }
              >;
            };
          }
        >;
        isBundle?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.ProductVariant, 'requiresComponents'>
        >;
      }
    >;
  };
};

export type LayoutQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type LayoutQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  headerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                > & {
                  resource?: StorefrontAPI.Maybe<{
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'altText' | 'height' | 'id' | 'url' | 'width'
                      >
                    >;
                  }>;
                }
              >;
              resource?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }>;
            }
          >;
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'altText' | 'height' | 'id' | 'url' | 'width'
              >
            >;
          }>;
        }
      >;
    }
  >;
  footerMenu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                > & {
                  resource?: StorefrontAPI.Maybe<{
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'altText' | 'height' | 'id' | 'url' | 'width'
                      >
                    >;
                  }>;
                }
              >;
              resource?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }>;
            }
          >;
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'altText' | 'height' | 'id' | 'url' | 'width'
              >
            >;
          }>;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'url' | 'width'>
    >;
  }>;
};

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'url' | 'width'>
    >;
  }>;
};

export type ParentMenuItem2Fragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'altText' | 'height' | 'id' | 'url' | 'width'
          >
        >;
      }>;
    }
  >;
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'url' | 'width'>
    >;
  }>;
};

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'altText' | 'height' | 'id' | 'url' | 'width'
              >
            >;
          }>;
        }
      >;
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'altText' | 'height' | 'id' | 'url' | 'width'
          >
        >;
      }>;
    }
  >;
  resource?: StorefrontAPI.Maybe<{
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'altText' | 'height' | 'id' | 'url' | 'width'>
    >;
  }>;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              resource?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'altText' | 'height' | 'id' | 'url' | 'width'
                  >
                >;
              }>;
            }
          >;
          resource?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'altText' | 'height' | 'id' | 'url' | 'width'
              >
            >;
          }>;
        }
      >;
      resource?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'altText' | 'height' | 'id' | 'url' | 'width'
          >
        >;
      }>;
    }
  >;
};

export type SwatchesQueryVariables = StorefrontAPI.Exact<{
  type: StorefrontAPI.Scalars['String']['input'];
}>;

export type SwatchesQuery = {
  metaobjects: {
    nodes: Array<
      Pick<StorefrontAPI.Metaobject, 'id'> & {
        fields: Array<
          Pick<StorefrontAPI.MetaobjectField, 'key' | 'value'> & {
            reference?: StorefrontAPI.Maybe<{
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'altText' | 'width' | 'height'
                > & {url: StorefrontAPI.Image['url']}
              >;
            }>;
          }
        >;
      }
    >;
  };
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  sellingPlanAllocation?: StorefrontAPI.Maybe<{
    sellingPlan: Pick<StorefrontAPI.SellingPlan, 'name'>;
  }>;
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    | 'id'
    | 'availableForSale'
    | 'requiresShipping'
    | 'title'
    | 'requiresComponents'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
    components: {
      nodes: Array<
        Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
          productVariant: Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
            product: Pick<StorefrontAPI.Product, 'handle'>;
          };
        }
      >;
    };
  };
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          sellingPlanAllocation?: StorefrontAPI.Maybe<{
            sellingPlan: Pick<StorefrontAPI.SellingPlan, 'name'>;
          }>;
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            | 'id'
            | 'availableForSale'
            | 'requiresShipping'
            | 'title'
            | 'requiresComponents'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            components: {
              nodes: Array<
                Pick<StorefrontAPI.ProductVariantComponent, 'quantity'> & {
                  productVariant: Pick<
                    StorefrontAPI.ProductVariant,
                    'id' | 'title'
                  > & {product: Pick<StorefrontAPI.Product, 'handle'>};
                }
              >;
            };
          };
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

interface GeneratedQueryTypes {
  '#graphql\n  query product(\n    $country: CountryCode\n    $language: LanguageCode\n    $handle: String!\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      title\n      vendor\n      handle\n      publishedAt\n      descriptionHtml\n      description\n      summary: description(truncateAt: 200)\n      encodedVariantExistence\n      encodedVariantAvailability\n      tags\n      featuredImage {\n        id\n        url\n        altText\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      badges: metafields(identifiers: [\n        { namespace: "custom", key: "best_seller" }\n      ]) {\n        key\n        namespace\n        value\n      }\n      options {\n        ...ProductOption\n      }\n      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n        ...ProductVariant\n      }\n      adjacentVariants(selectedOptions: $selectedOptions) {\n        ...ProductVariant\n      }\n      # Check if the product is a bundle\n      isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n        ...on ProductVariant {\n          requiresComponents\n          components(first: 100) {\n             nodes {\n                productVariant {\n                  ...ProductVariant\n                }\n                quantity\n             }\n          }\n          groupedBy(first: 100) {\n            nodes {\n                id\n              }\n            }\n          }\n      }\n      media(first: 50) {\n        nodes {\n          ...Media\n        }\n      }\n      seo {\n        description\n        title\n      }\n    }\n    shop {\n      name\n      primaryDomain {\n        url\n      }\n      shippingPolicy {\n        body\n        handle\n      }\n      refundPolicy {\n        body\n        handle\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    mediaContentType\n    alt\n    previewImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on Video {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        mimeType\n        url\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query getShopPrimaryDomain {\n    shop {\n      primaryDomain {\n        url\n      }\n    }\n  }\n': {
    return: GetShopPrimaryDomainQuery;
    variables: GetShopPrimaryDomainQueryVariables;
  };
  '#graphql\n  query shop($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    shop {\n      name\n      description\n    }\n  }\n': {
    return: ShopQuery;
    variables: ShopQueryVariables;
  };
  '#graphql\n  query featuredItems(\n    $country: CountryCode\n    $language: LanguageCode\n    $pageBy: Int = 12\n    $query: String\n  ) @inContext(country: $country, language: $language) {\n    featuredProducts: products(first: $pageBy, sortKey: BEST_SELLING, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: FeaturedItemsQuery;
    variables: FeaturedItemsQueryVariables;
  };
  '#graphql\n  fragment PredictiveArticle on Article {\n    __typename\n    id\n    title\n    handle\n    blog {\n      handle\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n  fragment PredictiveCollection on Collection {\n    __typename\n    id\n    title\n    handle\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n  fragment PredictivePage on Page {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n  }\n  fragment PredictiveProduct on Product {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n    vendor\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      price {\n        amount\n        currencyCode\n      }\n      compareAtPrice {\n        amount\n        currencyCode\n      }\n      selectedOptions {\n        name\n        value\n      }\n    }\n  }\n  fragment PredictiveQuery on SearchQuerySuggestion {\n    __typename\n    text\n    styledText\n    trackingParameters\n  }\n  query predictiveSearch(\n    $country: CountryCode\n    $language: LanguageCode\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $searchTerm: String!\n    $types: [PredictiveSearchType!]\n  ) @inContext(country: $country, language: $language) {\n    predictiveSearch(\n      limit: $limit,\n      limitScope: $limitScope,\n      query: $searchTerm,\n      types: $types,\n    ) {\n      articles {\n        ...PredictiveArticle\n      }\n      collections {\n        ...PredictiveCollection\n      }\n      pages {\n        ...PredictivePage\n      }\n      products {\n        ...PredictiveProduct\n      }\n      queries {\n        ...PredictiveQuery\n      }\n    }\n  }\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
  '#graphql\n  query ApiAllProducts(\n    $query: String\n    $count: Int\n    $reverse: Boolean\n    $country: CountryCode\n    $language: LanguageCode\n    $sortKey: ProductSortKeys\n  ) @inContext(country: $country, language: $language) {\n    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: ApiAllProductsQuery;
    variables: ApiAllProductsQueryVariables;
  };
  '#graphql\n  query article(\n    $language: LanguageCode\n    $blogHandle: String!\n    $articleHandle: String!\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      title\n      handle\n      articleByHandle(handle: $articleHandle) {\n        title\n        handle\n        contentHtml\n        publishedAt\n        tags\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        seo {\n          description\n          title\n        }\n      }\n      articles (first: 20) {\n        nodes {\n            ...Article\n        }\n      }\n    }\n  }\n  fragment Article on Article {\n    author: authorV2 {\n      name\n    }\n    contentHtml\n    excerpt\n    excerptHtml\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n  }\n': {
    return: ArticleQuery;
    variables: ArticleQueryVariables;
  };
  '#graphql\n  query blog(\n    $language: LanguageCode\n    $blogHandle: String!\n    $pageBy: Int!\n    $cursor: String\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      title\n      handle\n      seo {\n        title\n        description\n      }\n      articles(first: $pageBy, after: $cursor) {\n        edges {\n          node {\n            ...Article\n          }\n        }\n      }\n    }\n  }\n\n  fragment Article on Article {\n    author: authorV2 {\n      name\n    }\n    contentHtml\n    excerpt\n    excerptHtml\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n  }\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query collection(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $filters: [ProductFilter!]\n    $sortKey: ProductCollectionSortKeys!\n    $reverse: Boolean\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n    $customBannerNamespace: String!\n    $customBannerKey: String!\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      seo {\n        description\n        title\n      }\n      metafield(namespace: $customBannerNamespace, key: $customBannerKey) {\n        id\n        type\n        description\n        value\n        reference {\n          ... on MediaImage {\n            image {\n              id\n              url\n            }\n          }\n        }\n      }\n      image {\n        id\n        url\n        width\n        height\n        altText\n      }\n      products(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor,\n        filters: $filters,\n        sortKey: $sortKey,\n        reverse: $reverse\n      ) {\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n        nodes {\n          ...ProductCard\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n      }\n      highestPriceProduct: products(first: 1, sortKey: PRICE, reverse: true) {\n        nodes {\n          id\n          title\n          handle\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n      lowestPriceProduct: products(first: 1, sortKey: PRICE) {\n        nodes {\n          id\n          title\n          handle\n          priceRange {\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n    collections(first: 100) {\n      edges {\n        node {\n          title\n          handle\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: CollectionQuery;
    variables: CollectionQueryVariables;
  };
  '#graphql\n  query collections(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        id\n        title\n        description\n        handle\n        seo {\n          description\n          title\n        }\n        image {\n          id\n          url\n          width\n          height\n          altText\n        }\n        products(first: 1) {\n          nodes {\n            id\n            title\n            handle\n            media(first: 1) {\n              nodes {\n                previewImage {\n                  id\n                  url\n                  width\n                  height\n                  altText\n                }\n              }\n            }\n          }\n        }\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
  '#graphql\n  query PageDetails($language: LanguageCode, $handle: String!)\n  @inContext(language: $language) {\n    page(handle: $handle) {\n      id\n      title\n      handle\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageDetailsQuery;
    variables: PageDetailsQueryVariables;
  };
  '#graphql\n  fragment PolicyHandle on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n\n  query PoliciesHandle(\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n    $refundPolicy: Boolean!\n  ) @inContext(language: $language) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...PolicyHandle\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...PolicyHandle\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...PolicyHandle\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...PolicyHandle\n      }\n    }\n  }\n': {
    return: PoliciesHandleQuery;
    variables: PoliciesHandleQueryVariables;
  };
  '#graphql\n  fragment PolicyIndex on ShopPolicy {\n    id\n    title\n    handle\n  }\n\n  query PoliciesIndex {\n    shop {\n      privacyPolicy {\n        ...PolicyIndex\n      }\n      shippingPolicy {\n        ...PolicyIndex\n      }\n      termsOfService {\n        ...PolicyIndex\n      }\n      refundPolicy {\n        ...PolicyIndex\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesIndexQuery;
    variables: PoliciesIndexQueryVariables;
  };
  '#graphql\n  query allProducts(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n    $query: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: AllProductsQuery;
    variables: AllProductsQueryVariables;
  };
  '#graphql\n  query search(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $searchTerm: String\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor,\n      sortKey: RELEVANCE,\n      query: $searchTerm\n    ) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: SearchQuery;
    variables: SearchQueryVariables;
  };
  '#graphql\n  query StoreRobots($country: CountryCode, $language: LanguageCode)\n   @inContext(country: $country, language: $language) {\n    shop {\n      id\n    }\n  }\n': {
    return: StoreRobotsQuery;
    variables: StoreRobotsQueryVariables;
  };
  '#graphql\n  query collectionsByIds($country: CountryCode, $language: LanguageCode, $ids: [ID!]!)\n  @inContext(country: $country, language: $language) {\n    nodes(ids: $ids) {\n      ... on Collection {\n        id\n        title\n        handle\n        onlineStoreUrl\n        description\n        image {\n          id\n          altText\n          width\n          height\n          url\n        }\n      }\n    }\n  }\n': {
    return: CollectionsByIdsQuery;
    variables: CollectionsByIdsQueryVariables;
  };
  '#graphql\n  query featuredProducts($country: CountryCode, $language: LanguageCode, $query: String)\n  @inContext(country: $country, language: $language) {\n    products(first: 16, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: FeaturedProductsQuery;
    variables: FeaturedProductsQueryVariables;
  };
  '#graphql\n  query OurTeam ($type: String!, $first: Int) {\n    metaobjects(type: $type, first: $first) {\n      nodes {\n        fields {\n          key\n          type\n          value\n          reference {\n            ... on MediaImage {\n              alt\n              image {\n                altText\n                url\n                width\n                height\n              }\n            }\n          }\n        }\n        handle\n        id\n        type\n      }\n    }\n  }\n': {
    return: OurTeamQuery;
    variables: OurTeamQueryVariables;
  };
  '#graphql\n  query productRecommendations(\n    $productId: ID!\n    $count: Int\n    $country: CountryCode\n    $language: LanguageCode\n    $query: String\n  ) @inContext(country: $country, language: $language) {\n    recommended: productRecommendations(productId: $productId) {\n      ...ProductCard\n    }\n    additional: products(first: $count, sortKey: BEST_SELLING, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    publishedAt\n    handle\n    vendor\n    tags\n    images(first: 50) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      ...ProductOption\n    }\n    badges: metafields(identifiers: [\n      { namespace: "custom", key: "best_seller" }\n    ]) {\n      key\n      namespace\n      value\n    }\n    priceRange {\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      ...ProductVariant\n    }\n    # Check if the product is a bundle\n    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {\n      ...on ProductVariant {\n        requiresComponents\n      }\n    }\n  }\n  #graphql\n  fragment ProductOption on ProductOption {\n    name\n    optionValues {\n      name\n      firstSelectableVariant {\n        ...ProductVariant\n      }\n      swatch {\n        color\n        image {\n          previewImage {\n            url\n            altText\n          }\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    id\n    availableForSale\n    quantityAvailable\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    requiresComponents\n    components(first: 10) {\n      nodes {\n        productVariant {\n          id\n          title\n          product {\n            handle\n          }\n        }\n        quantity\n      }\n    }\n    groupedBy(first: 10) {\n      nodes {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n\n\n\n': {
    return: ProductRecommendationsQuery;
    variables: ProductRecommendationsQueryVariables;
  };
  '#graphql\n  query layout(\n    $language: LanguageCode\n    $headerMenuHandle: String!\n    $footerMenuHandle: String!\n  ) @inContext(language: $language) {\n    shop {\n      ...Shop\n    }\n    headerMenu: menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n    footerMenu: menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  fragment Shop on Shop {\n    id\n    name\n    description\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    resource {\n      ... on Collection {\n        image {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n      ... on Product {\n        image: featuredImage {\n          altText\n          height\n          id\n          url\n          width\n        }\n      }\n    }\n    tags\n    title\n    type\n    url\n  }\n\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n  }\n  fragment ParentMenuItem2 on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ParentMenuItem2\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n': {
    return: LayoutQuery;
    variables: LayoutQueryVariables;
  };
  '#graphql\n  query swatches($type: String!) {\n    metaobjects(first: 250, type: $type) {\n      nodes {\n        id\n        fields {\n          key\n          value\n          reference {\n            ... on MediaImage {\n              image {\n                id\n                altText\n                url: url(transform: { maxWidth: 300 })\n                width\n                height\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: SwatchesQuery;
    variables: SwatchesQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation customerCreate($input: CustomerCreateInput!) {\n    customerCreate(input: $input) {\n      customer {\n        firstName\n        lastName\n        email\n        phone\n        acceptsMarketing\n      }\n      customerUserErrors {\n        field\n        message\n        code\n      }\n    }\n  }\n': {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
