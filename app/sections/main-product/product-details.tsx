import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import { Link, useLoaderData } from "react-router";
import type { loader as productLoader } from "~/routes/($locale).products.$productHandle";

export function ProductDetails({ showShippingPolicy, showRefundPolicy }) {
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
    <Accordion.Root type="multiple">
      {details.map(({ title, content, learnMore }) => (
        <Accordion.Item key={title} value={title}>
          <Accordion.Trigger
            className={clsx([
              "flex w-full justify-between py-4 font-bold",
              "border-line-subtle border-b",
              "data-[state=open]:[&>.minus]:inline-block",
              "data-[state=open]:[&>.plus]:hidden",
            ])}
          >
            <span>{title}</span>
            <MinusIcon className="minus hidden h-4 w-4" />
            <PlusIcon className="plus h-4 w-4" />
          </Accordion.Trigger>
          <Accordion.Content
            style={
              {
                "--expand-to": "var(--radix-accordion-content-height)",
                "--expand-duration": "0.15s",
                "--collapse-from": "var(--radix-accordion-content-height)",
                "--collapse-duration": "0.15s",
              } as React.CSSProperties
            }
            className={clsx([
              "overflow-hidden",
              "data-[state=closed]:animate-collapse",
              "data-[state=open]:animate-expand",
            ])}
          >
            <div
              suppressHydrationWarning
              className="prose dark:prose-invert py-2.5"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {learnMore && (
              <Link
                className="border-line-subtle border-b pb-px text-body-subtle"
                to={learnMore}
              >
                Learn more
              </Link>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

function getExcerpt(text: string) {
  const regex = /<p.*>(.*?)<\/p>/;
  const match = regex.exec(text);
  return match?.length ? match[0] : text;
}
