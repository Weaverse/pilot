import Button from "~/components/button";
import { PageHeader, Text } from "./text";

export function GenericError({
  error,
}: {
  error?: { message: string; stack?: string };
}) {
  let heading = "Something’s wrong here.";
  let description = "We found an error while loading this page.";

  // TODO hide error in prod?
  if (error) {
    description += `\n${error.message}`;
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <>
      <PageHeader heading={heading} as="div">
        <Text width="narrow" as="p">
          {description}
        </Text>
        {error?.stack && (
          <pre
            style={{
              padding: "2rem",
              background: "hsla(10, 50%, 50%, 0.1)",
              color: "red",
              overflow: "auto",
              maxWidth: "100%",
            }}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: addLinksToStackTrace(error.stack),
            }}
          />
        )}
        <Button variant="outline" link="/">
          Take me to the home page
        </Button>
      </PageHeader>
    </>
  );
}

function addLinksToStackTrace(stackTrace: string) {
  return stackTrace?.replace(
    /^\s*at\s?.*?[(\s]((\/|\w\:).+)\)\n/gim,
    (all, m1) =>
      all.replace(
        m1,
        `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
      ),
  );
}
