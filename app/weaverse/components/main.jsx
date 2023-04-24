import {forwardRef} from 'react';

let Main = forwardRef((props, ref) => {
  return <main ref={ref} {...props} />;
});
export default Main;
