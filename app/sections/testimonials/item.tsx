import {
  type HydrogenComponentProps,
  type HydrogenComponentSchema,
  IMAGES_PLACEHOLDERS,
  type WeaverseImage,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import { Image } from "~/components/image";

interface TestimonialItemProps extends HydrogenComponentProps {
  heading: string;
  content: string;
  authorImage: WeaverseImage;
  authorName: string;
  authorTitle: string;
  hideOnMobile: boolean;
}

let TestimonialItem = forwardRef<HTMLDivElement, TestimonialItemProps>(
  (props, ref) => {
    let {
      heading,
      content,
      authorImage,
      authorName,
      authorTitle,
      hideOnMobile,
      ...rest
    } = props;
    return (
      <div
        ref={ref}
        {...rest}
        data-motion="slide-in"
        className={clsx(hideOnMobile && "hidden sm:block")}
      >
        <figure className="p-6 bg-gray-50 rounded">
          <blockquote>
            <div className="text-xl md:text-2xl">{heading}</div>
            <p
              className="my-4 text-gray-500"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </blockquote>
          <figcaption className="flex items-center space-x-3">
            <Image
              className="h-9 rounded-full"
              data={
                typeof authorImage === "object"
                  ? authorImage
                  : { url: authorImage, altText: authorName }
              }
              alt={authorName}
              width={36}
              sizes="auto"
            />
            <div className="space-y-0.5">
              <div className="font-medium">{authorName}</div>
              <div className="text-sm text-gray-500">{authorTitle}</div>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  },
);

export default TestimonialItem;

export let schema: HydrogenComponentSchema = {
  type: "testimonial--item",
  title: "Testimonial",
  inspector: [
    {
      group: "Testimonial",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Reliable international shipping",
          placeholder: "Testimonial heading",
        },
        {
          type: "textarea",
          name: "content",
          label: "Content",
          defaultValue: `I've ordered to multiple countries without issue. Their calculated duties/taxes and import fees make international delivery transparent.`,
          placeholder: "Testimonial content",
        },
        {
          type: "image",
          name: "authorImage",
          label: "Author image",
          defaultValue: IMAGES_PLACEHOLDERS.image,
        },
        {
          type: "text",
          name: "authorName",
          label: "Author Name",
          defaultValue: "Emma Thomas",
          placeholder: "Author name",
        },
        {
          type: "text",
          name: "authorTitle",
          label: "Author Title",
          defaultValue: "International Customer",
          placeholder: "Author title",
        },
        {
          type: "switch",
          label: "Hide on Mobile",
          name: "hideOnMobile",
          defaultValue: false,
        },
      ],
    },
  ],
};
