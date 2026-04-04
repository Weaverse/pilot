import { CaretDownIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import Link from "~/components/link";
import type { loader as productLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";

function getExcerpt(text: string) {
  const regex = /<p.*>(.*?)<\/p>/;
  const match = regex.exec(text);
  return match?.length ? match[0] : text;
}

interface CollapsibleDetailsProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  showShippingPolicy: boolean;
  showRefundPolicy: boolean;
}

export default function CollapsibleDetails(props: CollapsibleDetailsProps) {
  const { showShippingPolicy, showRefundPolicy, ...rest } = props;
  const { shop, product } = useLoaderData<typeof productLoader>();
  const { description } = product;
  const { shippingPolicy, refundPolicy } = shop;
  const details = [
    { title: "Description", content: description },
    showShippingPolicy &&
      shippingPolicy?.body && {
        title: "Shipping",
        content: getExcerpt(shippingPolicy.body),
        learnMore: `/policies/${shippingPolicy.handle}`,
      },
    showRefundPolicy &&
      refundPolicy?.body && {
        title: "Returns",
        content: getExcerpt(refundPolicy.body),
        learnMore: `/policies/${refundPolicy.handle}`,
      },
  ].filter(Boolean);

  return (
    <div {...rest}>
      <Accordion.Root type="multiple" className="space-y-3">
        {details.map(({ title, content, learnMore }) => (
          <Accordion.Item
            key={title}
            value={title}
            className="rounded-md border border-gray-300"
          >
            <Accordion.Trigger
              className={cn(
                "flex w-full items-center justify-between px-5 py-4 font-bold",
                "data-[state=open]:[&>svg]:rotate-180",
              )}
            >
              <span>{title}</span>
              <CaretDownIcon className="h-4 w-4 transition-transform duration-200" />
            </Accordion.Trigger>
            <Accordion.Content
              className={cn(
                "overflow-hidden",
                "[--expand-to:var(--radix-accordion-content-height)]",
                "[--collapse-from:var(--radix-accordion-content-height)]",
                "data-[state=closed]:animate-collapse",
                "data-[state=open]:animate-expand",
              )}
            >
              <div className="space-y-4 px-5 pb-4">
                <div
                  suppressHydrationWarning
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                {learnMore && (
                  <Link
                    variant="underline"
                    to={learnMore}
                    className="float-right"
                  >
                    Learn more →
                  </Link>
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

export const schema = createSchema({
  type: "mp--collapsible-details",
  title: "Collapsible details",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "switch",
          label: "Show shipping policy",
          name: "showShippingPolicy",
          defaultValue: true,
        },
        {
          type: "switch",
          label: "Show refund policy",
          name: "showRefundPolicy",
          defaultValue: true,
        },
      ],
    },
  ],
});
