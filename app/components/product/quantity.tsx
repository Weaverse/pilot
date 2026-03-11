import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { ScrollReveal } from "~/components/scroll-reveal";

interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}
export function Quantity(props: QuantityProps) {
  const { value, onChange, label = "Quantity" } = props;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent the user from entering non-numeric characters
    if (
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      Number.isNaN(Number(e.key))
    ) {
      e.preventDefault();
    }
  };
  return (
    <ScrollReveal className="space-y-1.5">
      <legend className="font-bold leading-tight">{label}</legend>
      <div className="flex w-fit items-center border border-line">
        <button
          type="button"
          name="decrease-quantity"
          aria-label="Decrease quantity"
          className="flex h-10 w-10 items-center justify-center transition"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <MinusIcon size={18} />
        </button>
        <input
          className="w-12 border-none px-1 py-2.5 text-center focus:outline-hidden focus:ring-0"
          value={value}
          onKeyDown={handleKeyDown}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
        />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-body transition hover:text-body"
          name="increase-quantity"
          aria-label="Increase quantity"
          onClick={() => onChange(value + 1)}
        >
          <PlusIcon size={18} />
        </button>
      </div>
    </ScrollReveal>
  );
}
