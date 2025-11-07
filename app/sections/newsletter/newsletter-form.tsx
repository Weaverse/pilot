import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useFetcher } from "react-router";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import type { CustomerApiPlayLoad } from "~/routes/api/customer";

interface NewsLetterInputProps extends HydrogenComponentProps {
  width: number;
  placeholder: string;
  buttonText: string;
  helpText: string;
  successText?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function NewsLetterForm(props: NewsLetterInputProps) {
  const {
    buttonText,
    width,
    placeholder,
    helpText,
    successText,
    ref,
    ...rest
  } = props;
  const fetcher = useFetcher();
  const { state, Form } = fetcher;
  const data = fetcher.data as CustomerApiPlayLoad;
  const submitted = state === "idle" && data;
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
            className="w-full border-none bg-transparent py-3 pr-3 pl-1.5 leading-tight focus:outline-hidden focus:ring-0"
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
      {submitted && (
        <Banner variant={ok ? "success" : "error"} className="mt-4">
          {ok ? successText : errorMessage || "Something went wrong"}
        </Banner>
      )}
    </div>
  );
}

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
