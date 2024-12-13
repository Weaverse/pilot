import { EnvelopeSimple } from "@phosphor-icons/react";
import { useFetcher } from "@remix-run/react";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import { Button } from "~/components/button";
import type { CustomerApiPlayLoad } from "~/routes/($locale).api.customer";

interface NewsLetterInputProps extends HydrogenComponentProps {
  width: number;
  placeholder: string;
  buttonText: string;
  helpText: string;
  successText?: string;
}

let NewsLetterForm = forwardRef<HTMLDivElement, NewsLetterInputProps>(
  (props, ref) => {
    let { buttonText, width, placeholder, helpText, successText, ...rest } =
      props;
    let fetcher = useFetcher();
    let { state, Form } = fetcher;
    let data = fetcher.data as CustomerApiPlayLoad;
    let { ok, errorMessage } = data || {};

    return (
      <div ref={ref} {...rest} className="mx-auto max-w-full" style={{ width }}>
        <Form
          method="POST"
          action="/api/customer"
          className="flex items-center w-full"
          data-motion="fade-up"
        >
          <div className="flex items-center border-r-0 border-y border-l grow">
            <EnvelopeSimple className="w-5 h-5 ml-3 mr-1.5 shrink-0" />
            <input
              name="email"
              type="email"
              required
              placeholder={placeholder}
              className="py-3 pr-3 pl-1.5 focus:outline-none leading-tight w-full bg-transparent"
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
            className="text-body-subtle mt-2"
            data-motion="fade-up"
            dangerouslySetInnerHTML={{ __html: helpText }}
          />
        )}
        <div
          className={clsx(
            "mx-auto mt-4 font-medium text-center",
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

export let schema: HydrogenComponentSchema = {
  type: "newsletter-form",
  title: "Form",
  inspector: [
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
};
