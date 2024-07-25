import { useFetcher } from "@remix-run/react";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef } from "react";
import Button from "~/components/Button";
import { IconEnvelopeSimple } from "~/components/Icons";
import type { CustomerApiPlayLoad } from "~/routes/($locale).api.customer";

interface NewsLetterInputProps extends HydrogenComponentProps {
  width: number;
  placeholder: string;
  buttonText: string;
  helpText: string;
}

let NewsLetterForm = forwardRef<HTMLDivElement, NewsLetterInputProps>(
  (props, ref) => {
    let { buttonText, width, placeholder, helpText, ...rest } = props;
    let { data, state, Form } = useFetcher<CustomerApiPlayLoad>();
    // let isError = fetcher.state === "idle" && fetcher.data?.errors;
    // let isSuccess = fetcher.state === "idle" && fetcher.data?.customer;
    // let alertMessage = "";
    // let alertMessageClass = "";
    // if (isError && fetcher.data?.errors) {
    //   const firstError = fetcher.data?.errors[0];
    //   alertMessage =
    //     firstError.code === "TAKEN"
    //       ? firstError.message
    //       : "Some things went wrong!";
    //   alertMessageClass = "text-red-700";
    // } else if (isSuccess && fetcher.data?.customer && emailInputRef.current) {
    //   alertMessage = "Subscribe successfully!";
    //   // emailInputRef.current.value = "";
    //   alertMessageClass = "text-green-700";
    // }

    return (
      <div
        ref={ref}
        {...rest}
        className="space-y-2 mx-auto max-w-full"
        style={{ width }}
      >
        <Form
          method="POST"
          action="/api/customer"
          className="flex items-center w-full"
        >
          <div className="flex items-center border-r-0 border-y border-l grow">
            <IconEnvelopeSimple className="w-5 h-5 text-gray-600 ml-2.5 shrink-0" />
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
        <div
          className="text-gray-600"
          dangerouslySetInnerHTML={{ __html: helpText }}
        />
      </div>
    );
  },
);

export default NewsLetterForm;

export let schema: HydrogenComponentSchema = {
  type: "newsletter-form",
  title: "Input",
  inspector: [
    {
      group: "Input",
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
        {
          type: "richtext",
          name: "helpText",
          label: "Help text",
          defaultValue:
            '<div>We care about the protection of your data. Read our <a href="/policies/privacy-policy" style="color: #007AFF; text-decoration: underline;">Privacy Policy</a>.</div>',
        },
      ],
    },
  ],
};
