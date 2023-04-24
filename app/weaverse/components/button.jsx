import {forwardRef} from 'react';

let Button = forwardRef((props, ref) => {
  const {children, onClick} = props;
  return (
    <button ref={ref} className="button" onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
