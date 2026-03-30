import { IMAGES_PLACEHOLDERS } from "@weaverse/hydrogen";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { Section, type SectionProps } from "~/components/section";

export function SingleProductPlaceholder({
  ref,
  ...rest
}: SectionProps & { ref: React.Ref<HTMLElement> }) {
  return (
    <Section ref={ref} {...rest}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square bg-background-subtle-1">
          <Image
            src={IMAGES_PLACEHOLDERS.product_1}
            alt="Product placeholder"
            className="h-full w-full object-cover"
            width={1000}
            height={1000}
          />
        </div>
        <div className="flex flex-col justify-start gap-5">
          <div className="space-y-4">
            <h3 className="tracking-tight">Product title</h3>
            <p className="text-lg">$99</p>
            <p className="leading-relaxed text-body-subtle">
              Select a product in the section settings to display it here.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="h-9 w-9 rounded-full bg-gray-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-14 bg-gray-200" />
            <div className="h-10 w-14 bg-gray-200" />
            <div className="h-10 w-14 bg-gray-200" />
          </div>
          <Button>Add to Cart</Button>
        </div>
      </div>
    </Section>
  );
}
