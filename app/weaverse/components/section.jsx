import {forwardRef} from 'react';

let Section = forwardRef((props, ref) => {
  return <section ref={ref} {...props} />;
});

export default Section;
