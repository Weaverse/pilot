import { createSchema } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import type { SectionProps } from "~/components/section";
import { Section, sectionSettings } from "~/components/section";

type TestimonialsProps = SectionProps;

const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(
  (props, ref) => {
    const { children, ...rest } = props;

    return (
      <Section ref={ref} {...rest}>
        {children}
      </Section>
    );
  },
);

export default Testimonials;

export const schema = createSchema({
  type: "testimonials",
  title: "Testimonials",
  childTypes: ["subheading", "heading", "paragraph", "testimonials-items"],
  settings: sectionSettings,
  presets: {
    children: [
      {
        type: "heading",
        content: "Testimonials",
      },
      {
        type: "paragraph",
        content:
          "We are a team of passionate people whose goal is to improve everyone's life through disruptive products. We build great products to solve your business problems.",
      },
      {
        type: "testimonials-items",
        children: [
          {
            type: "testimonial--item",
            authorName: "Glen P.",
            authorTitle: "Founder, eCom Graduates",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/glen_p.webp?v=1711343796",
            heading: "Shopify Headless Game Changer",
            content:
              "I run a Shopify development agency and this is the kind of tool I've been looking for. Clients do not understand why headless is rather expensive to build but having a tool/option like this is a game changer. ",
          },
          {
            type: "testimonial--item",
            authorName: "Tom H.",
            authorTitle: "Owner, On The Road UK",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/tom_h.webp?v=1711343959",
            heading: "Intuitive Tool with Big Plus",
            content:
              "I love how intuitive the tool is. It looks very promising for my potential clients, and being able to easily use meta objects with this is a big plus.",
          },
          {
            type: "testimonial--item",
            authorName: "Kenneth G.",
            authorTitle: "Frontend Developer, DevInside Agency",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/Kenneth_g.webp?v=1711359007",
            heading: "Hydrogen Editor Mirrors Shopify",
            content:
              "We already love the Shopify theme editor, so having something similar for Hydrogen is so cool because now we can get hydrogen storefront setup similar to a liquid store.",
            hideOnMobile: true,
          },
          {
            type: "testimonial--item",
            authorName: "Leonardo G.",
            authorTitle: "Solo developer",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/leo_1.webp?v=1711359106",
            heading: "Hydrogen Shift Eases for Solo Dev",
            content:
              "As a solo dev with a small Shopify shop, this is something interesting to hear about. I'm migrating from a GatsbyJS headless to Hydrogen solution, and Weaverse makes it a lot easier because I want to avoid hydrogen-react with NextJS!",
            hideOnMobile: true,
          },
          {
            type: "testimonial--item",
            authorName: "Micky M.",
            authorTitle: "Owner, Joylery Silver",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/micky_m.webp?v=1711359054",
            heading: "Weaverse Makes Headless Accessible",
            content:
              "We struggled with site speed and as an ex-developer, I wanted to go headless but with only one in-house developer, it seemed impossible. Weaverse really made going headless a lot more accessible.",
            hideOnMobile: true,
          },
          {
            type: "testimonial--item",
            authorName: "John D.",
            authorTitle: "CEO, Tech Solutions",
            authorImage:
              "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/glen_p.webp?v=1711343796",
            heading: "Incredible Tool for Development",
            content:
              "As a tech company CEO, this tool has revolutionized how we approach development. It's intuitive, efficient, and has made our processes significantly more streamlined.",
            hideOnMobile: true,
          },
        ],
      },
    ],
  },
});
