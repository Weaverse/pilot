import type {HydrogenComponentSchema} from '@weaverse/hydrogen';
import {forwardRef} from 'react';

import type {SectionProps} from '~/sections/shared/Section';
import {Section, sectionInspector} from '~/sections/shared/Section';

interface ColumnsWithImagesProps extends SectionProps {}

let ColumnsWithImages = forwardRef<HTMLElement, ColumnsWithImagesProps>(
  (props, ref) => {
    let {children, ...rest} = props;
    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default ColumnsWithImages;

export let schema: HydrogenComponentSchema = {
  type: 'columns-with-images',
  title: 'Columns with images',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [sectionInspector],
  childTypes: ['subheading', 'heading', 'description'],
  presets: {
    children: [
      {
        type: 'heading',
        content: 'Columns with images',
      },
      {
        type: 'columns-with-images--items',
      },
    ],
  },
};
