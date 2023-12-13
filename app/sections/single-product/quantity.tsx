interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
}
export function Quantity(props: QuantityProps) {
  let {value, onChange} = props;
  let handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent the user from entering non-numeric characters
    if (
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      isNaN(Number(e.key))
    ) {
      e.preventDefault();
    }
  };
  return (
    <div className="space-y-1.5">
      <legend className="whitespace-pre-wrap max-w-prose font-bold text-lg leading-snug">
        Quantity
      </legend>
      <div className="rounded-sm border w-fit">
        <button
          name="decrease-quantity"
          aria-label="Decrease quantity"
          className="w-10 h-10 transition "
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <span>&#8722;</span>
        </button>
        <input
          className="w-12 px-1 py-2.5 text-center"
          value={value}
          onKeyDown={handleKeyDown}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <button
          className="w-10 h-10 transition text-body hover:text-body"
          name="increase-quantity"
          aria-label="Increase quantity"
          onClick={() => onChange(value + 1)}
        >
          <span>&#43;</span>
        </button>
      </div>
    </div>
  );
}
