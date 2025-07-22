import Link from "~/components/link";
import { Section } from "~/components/section";

export function GenericError({
  error,
}: {
  error?: { message: string; stack?: string };
}) {
  const heading = "Something’s wrong here.";
  let description = "We found an error while loading this page.";

  // TODO hide error in prod?
  if (error) {
    description += `\n${error.message}`;
    // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
    console.error(error);
  }

  return (
    <Section
      width="fixed"
      verticalPadding="large"
      containerClassName="space-y-4 flex justify-center items-center flex-col"
    >
      <h4 className="font-medium">{heading}</h4>
      <p>{description}</p>
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
      <Link variant="outline" to="/" className="w-fit">
        Take me to the home page
      </Link>
    </Section>
  );
}

function addLinksToStackTrace(stackTrace: string) {
  return stackTrace?.replace(
    /^\s*at\s?.*?[(\s]((\/|\w:).+)\)\n/gim,
    (all, m1) =>
      all.replace(
        m1,
        `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
      ),
  );
}
