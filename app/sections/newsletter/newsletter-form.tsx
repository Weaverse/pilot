import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/button";
import type { CustomerApiPlayLoad } from "~/routes/($locale).api.customer";

interface NewsLetterInputProps extends HydrogenComponentProps {
  width: number;
  placeholder: string;
  buttonText: string;
  helpText: string;
  successText?: string;
}

const NewsLetterForm = forwardRef<HTMLDivElement, NewsLetterInputProps>(
  (props, ref) => {
    const { buttonText, width, placeholder, helpText, successText, ...rest } =
      props;
    const fetcher = useFetcher();
    const { state, Form } = fetcher;
    const data = fetcher.data as CustomerApiPlayLoad;
    const { ok, errorMessage } = data || {};

    return (
      <div ref={ref} {...rest} className="mx-auto max-w-full" style={{ width }}>
        <Form
          method="POST"
          action="/api/customer"
          className="flex w-full items-center"
          data-motion="fade-up"
        >
          <div className="flex grow items-center border-y border-r-0 border-l">
            <EnvelopeSimpleIcon className="mr-1.5 ml-3 h-5 w-5 shrink-0" />
            <input
              name="email"
              type="email"
              required
              placeholder={placeholder}
              className="w-full bg-transparent py-3 pr-3 pl-1.5 leading-tight focus:outline-hidden"
            />
          </div>
          <Button
            type="submit"
            className="gap-3"
            loading={state === "submitting"}
          >
            {buttonText}
          </Button>
        </Form>
        {helpText && (
          <div
            className="mt-2 text-body-subtle"
            data-motion="fade-up"
            dangerouslySetInnerHTML={{ __html: helpText }}
          />
        )}
        <div
          className={clsx(
            "mx-auto mt-4 text-center font-medium",
            state === "idle" && data ? "visible" : "invisible",
            ok ? "text-green-700" : "text-red-700",
          )}
        >
          {ok ? successText : errorMessage || "Something went wrong"}
        </div>
      </div>
    );
  },
);

export default NewsLetterForm;

export const schema = createSchema({
  type: "newsletter-form",
  title: "Form",
  settings: [
    {
      group: "Form",
      inputs: [
        {
          type: "range",
          name: "width",
          label: "Input width",
          configs: {
            min: 300,
            max: 600,
            step: 10,
            unit: "px",
          },
          defaultValue: 500,
        },
        {
          type: "text",
          name: "placeholder",
          label: "Placeholder",
          defaultValue: "Enter your email",
          placeholder: "Enter your email",
        },
        {
          type: "richtext",
          name: "helpText",
          label: "Help text",
          defaultValue:
            '<div>We care about the protection of your data. Read our <a href="/policies/privacy-policy" style="color: #007AFF; text-decoration: underline;">Privacy Policy</a>.</div>',
        },
        {
          type: "text",
          name: "successText",
          label: "Success message",
          placeholder: "🎉 Thank you for subscribing!",
          defaultValue: "🎉 Thank you for subscribing!",
        },
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          placeholder: "Subscribe",
          defaultValue: "Subscribe",
        },
      ],
    },
  ],
});
