import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { Button } from "~/components/button";
import { openShopifyInbox } from "~/components/shopify-inbox";

interface MessageUsButtonProps extends HydrogenComponentProps {
  buttonText: string;
  variant: "primary" | "secondary" | "outline" | "underline";
}

function MessageUsButton(props: MessageUsButtonProps) {
  const { buttonText, variant, ...rest } = props;
  return (
    <div {...rest}>
      <Button onClick={openShopifyInbox} variant={variant}>
        {buttonText}
      </Button>
    </div>
  );
}

export default MessageUsButton;

export const schema = createSchema({
  type: "message-us-button",
  title: "Message us button",
  settings: [
    {
      group: "Button",
      inputs: [
        {
          type: "text",
          name: "buttonText",
          label: "Button text",
          defaultValue: "Message us",
          placeholder: "Message us",
        },
        {
          type: "select",
          name: "variant",
          label: "Variant",
          configs: {
            options: [
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "outline", label: "Outline" },
              { value: "underline", label: "Underline" },
            ],
          },
          defaultValue: "primary",
        },
      ],
    },
  ],
});
