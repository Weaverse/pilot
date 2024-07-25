import { useFetcher } from "@remix-run/react";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import clsx from "clsx";
import { forwardRef } from "react";
import Button from "~/components/Button";
import { IconEnvelopeSimple } from "~/components/Icons";
import type { CustomerApiPlayLoad } from "~/routes/($locale).api.customer";

interface NewsLetterInputProps extends HydrogenComponentProps {
  width: number;
  placeholder: string;
  buttonText: string;
  helpText: string;
  successText?: string;
  errorText?: string;
}

let NewsLetterForm = forwardRef<HTMLDivElement, NewsLetterInputProps>(
  (props, ref) => {
    let {
      buttonText,
      width,
      placeholder,
      helpText,
      successText,
      errorText,
      ...rest
    } = props;
    let fetcher = useFetcher();
    let { state, Form } = fetcher;
    let data = fetcher.data as CustomerApiPlayLoad;
    let { ok, errorMessage, customer } = data || {};

    return (
      <div ref={ref} {...rest} className="mx-auto max-w-full" style={{ width }}>
        <Form
          method="POST"
          action="/api/customer"
          className="flex items-center w-full"
        >
          <div className="flex items-center border-r-0 border-y border-l grow">
            <IconEnvelopeSimple className="w-5 h-5 text-body/80 ml-2.5 shrink-0" />
            <input
              name="email"
              type="email"
              required
              placeholder={placeholder}
              className="p-3 focus:outline-none leading-tight"
            />
          </div>
          <Button
            type="submit"
            loading={state === "submitting"}
            className="gap-3"
          >
            {buttonText}
          </Button>
        </Form>
        {helpText && (
          <div
            className="text-body/60 mt-2"
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
          type: "heading",
          label: "Messages",
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
          name: "errorText",
          label: "Error message",
          placeholder: "😔 Some things went wrong!",
          defaultValue: "😔 Some things went wrong!",
        },
        {
          type: "richtext",
          name: "helpText",
          label: "Help text",
          defaultValue:
            '<div>We care about the protection of your data. Read our <a href="/policies/privacy-policy" style="color: #007AFF; text-decoration: underline;">Privacy Policy</a>.</div>',
        },
        {
          type: "heading",
          label: "Input",
        },
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
          defaultValue: 400,
        },
        {
          type: "text",
          name: "placeholder",
          label: "Placeholder",
          defaultValue: "Enter your email",
          placeholder: "Enter your email",
        },
        {
          type: "heading",
          label: "Subscribe button",
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
