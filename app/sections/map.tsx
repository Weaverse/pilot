import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import type { ButtonStyleProps } from "~/components/Button";
import Button, { buttonStylesInputs } from "~/components/Button";
import type { SectionProps } from "~/components/Section";
import { Section } from "~/components/Section";

let variants = cva("", {
	variants: {
		alignment: {
			left: "flex-start",
			center: "center",
			right: "flex-end",
		},
	},
});

interface MapSectionProps
	extends Omit<SectionProps, "backgroundColor">,
		ButtonStyleProps {
	address: string;
	heading: string;
	description: string;
	color: string;
	alignment: "left" | "center" | "right";
	buttonText: string;
	height: string;
}

let MapSection = forwardRef<HTMLElement, MapSectionProps>((props, ref) => {
	let {
		heading,
		color,
		alignment,
		description,
		address,
		buttonText,
		buttonStyle,
		backgroundColor,
		textColor,
		borderColor,
		backgroundColorHover,
		textColorHover,
		borderColorHover,
		...rest
	} = props;

	return (
		<Section ref={ref} {...rest} containerClassName={variants({ alignment })}>
			<iframe
				className="w-full h-full object-cover"
				title="Google map embedded frame"
				src={`https://maps.google.com/maps?t=m&q=${address}&ie=UTF8&&output=embed`}
			/>
			<div className="relative bg-white rounded-3xl p-8 border-2 border-solid border-gray-200 h-fit w-80">
				<div className="z-10 flex flex-col gap-6">
					{heading && (
						<p className="text-2xl font-bold" style={{ color: color }}>
							{heading}
						</p>
					)}
					{address && (
						<p className="text-sm font-normal" style={{ color: color }}>
							{address}
						</p>
					)}
					{description && (
						<p className="text-sm font-normal" style={{ color: color }}>
							{description}
						</p>
					)}
					{buttonText && (
						<Button
							text={buttonText}
							link={`https://www.google.com/maps/search/${address}`}
							openInNewTab
							variant="secondary"
							buttonStyle="custom"
							backgroundColor={backgroundColor}
							textColor={textColor}
							borderColor={borderColor}
							backgroundColorHover={backgroundColorHover}
							textColorHover={textColorHover}
							borderColorHover={borderColorHover}
						/>
					)}
				</div>
			</div>
		</Section>
	);
});

export default MapSection;

export let schema: HydrogenComponentSchema = {
	type: "map",
	title: "Map",
	inspector: [
		{
			group: "Map",
			inputs: [
				{
					type: "text",
					name: "heading",
					label: "Heading",
					defaultValue: "Our store address",
				},
				{
					type: "color",
					name: "textColor",
					label: "Text color",
					defaultValue: "#333333",
				},
				{
					type: "toggle-group",
					label: "Content alignment",
					name: "contentAlignment",
					configs: {
						options: [
							{ label: "Left", value: "flex-start" },
							{ label: "Center", value: "center" },
							{ label: "Right", value: "flex-end" },
						],
					},
					defaultValue: "center",
				},
				{
					type: "text",
					name: "address",
					label: "Address",
					defaultValue: "Inglewood, California US, 90301",
				},
				{
					type: "richtext",
					label: "Description",
					name: "description",
					defaultValue: `
            301 Front St W, Toronto, ON M5V 2T6, Canada
            Mon - Fri, 8:30am - 10:30pm
            Saturday, 8:30am - 10:30pm
            Sunday, 8:30am - 10:30pm
          `,
				},
				{
					type: "heading",
					label: "Button (optional)",
				},
				{
					type: "text",
					name: "buttonText",
					label: "Button text",
					defaultValue: "Get directions",
					placeholder: "Get directions",
				},
				...buttonStylesInputs.filter((inp) => inp.name !== "buttonStyle"),
			],
		},
	],
};
