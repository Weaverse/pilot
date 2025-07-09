import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import type { PageDetailsQuery } from "storefront-api.generated";
import { Link } from "~/components/link";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface PageProps extends SectionProps {}

const Page = forwardRef<HTMLElement, PageProps>((props, ref) => {
  const { page } = useLoaderData<PageDetailsQuery>();

  if (page) {
    return (
      <Section ref={ref} {...props}>
        <div className="mb-4 flex items-center justify-center gap-2 text-body-subtle">
          <Link to="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
          <span>/</span>
          <span>pages</span>
          <span>/</span>
          <span>{page.title}</span>
        </div>
        <h1 className="h2 mb-8 text-center md:mb-16">{page.title}</h1>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: page.body }}
          className="prose mx-auto max-w-3xl border-line-subtle border-t"
        />
      </Section>
    );
  }
  return <Section ref={ref} {...props} />;
});

export default Page;

export const schema = createSchema({
  type: "page",
  title: "Page",
  limit: 1,
  enabledOn: {
    pages: ["PAGE"],
  },
  settings: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(
        (input) => input.name !== "gap" && input.name !== "borderRadius",
      ),
    },
  ],
});
