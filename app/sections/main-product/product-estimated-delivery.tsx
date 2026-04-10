import { TruckIcon } from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { cn } from "~/utils/cn";

interface EstimatedDeliveryProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  minDays: number;
  maxDays: number;
  textColor: string;
  backgroundColor: string;
  heading: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "2-digit" });
}

export default function ProductEstimatedDelivery(
  props: EstimatedDeliveryProps,
) {
  let { minDays, maxDays, heading, textColor, backgroundColor, ...rest } =
    props;

  let today = new Date();
  let minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);
  let maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  return (
    <div
      {...rest}
      className={cn("flex items-center gap-2 rounded-md px-4 py-3 text-sm")}
      style={{ color: textColor, backgroundColor }}
    >
      <TruckIcon className="size-5 shrink-0" />
      <span>
        {heading} <strong className="font-bold">{formatDate(minDate)}</strong>{" "}
        and <strong className="font-bold">{formatDate(maxDate)}</strong>.
      </span>
    </div>
  );
}

export let schema = createSchema({
  type: "mp--estimated-delivery",
  title: "Estimated delivery",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "text",
          label: "Heading",
          name: "heading",
          defaultValue: "Estimated delivery between",
          placeholder: "Estimated delivery between",
        },
        {
          type: "range",
          label: "Minimum days",
          name: "minDays",
          defaultValue: 3,
          configs: {
            min: 1,
            max: 30,
            step: 1,
          },
        },
        {
          type: "range",
          label: "Maximum days",
          name: "maxDays",
          defaultValue: 5,
          configs: {
            min: 1,
            max: 30,
            step: 1,
          },
        },
        {
          type: "color",
          label: "Text color",
          name: "textColor",
          defaultValue: "#0d5e5e",
        },
        {
          type: "color",
          label: "Background color",
          name: "backgroundColor",
          defaultValue: "#e0f2f1",
        },
      ],
    },
  ],
});
