import {forwardRef} from 'react';

let Text = forwardRef((props, ref) => {
  const {children, className} = props;
  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
});

export default Text;
