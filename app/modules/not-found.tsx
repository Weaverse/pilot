import { Button } from "./button";
import { FeaturedItemsSection } from "./featured-section";
import { PageHeader, Text } from "./text";

export function NotFound({ type = "page" }: { type?: string }) {
  const heading = `We’ve lost this ${type}`;
  const description = `We couldn’t find the ${type} you’re looking for. Try checking the URL or heading back to the home page.`;

  return (
    <>
      <PageHeader heading={heading}>
        <Text width="narrow" as="p">
          {description}
        </Text>
        <Button width="auto" variant="secondary" to={"/"}>
          Take me to the home page
        </Button>
      </PageHeader>
      <FeaturedItemsSection />
    </>
  );
}
