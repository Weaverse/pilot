import {forwardRef} from 'react';

let Text = forwardRef((props, ref) => {
  const {children, className} = props;
  // return (
  //   <p ref={ref} className={className}>
  //     {children}
  //   </p>
  // );
  return (
    <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
      hehe
      <br className="hidden lg:inline-block" />
      readymade gluten
    </h1>
  );
});

export default Text;
