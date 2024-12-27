import { useLoaderData } from "@remix-run/react";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { PageDetailsQuery } from "storefront-api.generated";
import { Link } from "~/components/link";
import { layoutInputs, Section, type SectionProps } from "~/components/section";

interface PageProps extends SectionProps {}

let Page = forwardRef<HTMLElement, PageProps>((props, ref) => {
  let { page } = useLoaderData<PageDetailsQuery>();

  if (page) {
    return (
      <Section ref={ref} {...props}>
        <div className="flex items-center justify-center gap-2 text-body-subtle mb-4">
          <Link to="/" className="hover:underline underline-offset-4">
            Home
          </Link>
          <span>/</span>
          <span>pages</span>
          <span>/</span>
          <span>{page.title}</span>
        </div>
        <h1 className="h2 text-center mb-8 md:mb-16">{page.title}</h1>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: page.body }}
          className="prose max-w-3xl mx-auto border-t border-line-subtle"
        />
      </Section>
    );
  }
  return <Section ref={ref} {...props} />;
});

export default Page;

export let schema: HydrogenComponentSchema = {
  type: "page",
  title: "Page",
  limit: 1,
  enabledOn: {
    pages: ["PAGE"],
  },
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter(
        (input) => input.name !== "gap" && input.name !== "borderRadius",
      ),
    },
  ],
};
