import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
import {forwardRef} from 'react';
import type {SectionProps} from '~/sections/shared/Section';
import {Section, sectionConfigs} from '~/sections/shared/Section';

type VideoProps = SectionProps & {
  heading: string;
  description: string;
};

let Video = forwardRef<HTMLElement, VideoProps>((props, ref) => {
  let {children, ...rest} = props;
  return (
    <Section ref={ref} {...rest}>
      {children}
    </Section>
  );
});

export default Video;

export let schema: HydrogenComponentSchema = {
  type: 'video',
  title: 'Video',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [sectionConfigs],
  childTypes: ['heading', 'description', 'video--item'],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'This is how Shopify Headless done right!',
      },
      {
        type: 'description',
        content:
          'Our Hydrogen store is set up by Shopify Experts and can be customized with Weaverse. It can be easily published to Oxygen and then handed over to the merchants. The Hydrogen store offers the ability to connect to any data source from the server side, eliminating the need for developers to create custom apps. Weaverse provides a user-friendly way for merchants to edit their storefront, similar to the Liquid theme customizer. It also offers developers a powerful toolset and a reusable bootstrap theme, which can save up to 70% of their time when building a headless storefront.',
      },
      {
        type: 'video--item',
      },
    ],
  },
};
