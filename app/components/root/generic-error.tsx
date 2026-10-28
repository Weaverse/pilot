import { useLocation } from "react-router";
import Link, { variants } from "~/components/link";
import { Section } from "~/components/section";
import { cn } from "~/utils/cn";

/**
 * Shown when Weaverse could not provide the page.
 *
 * `unavailable` is temporary and the page itself exists, so the action is to
 * load the same URL again as a full document. Any other failure is a
 * configuration problem a shopper cannot fix; its details stay in the server
 * log rather than on the page.
 */
export function WeaverseFailure({
  failure,
}: {
  failure: "unavailable" | "error";
}) {
  const { pathname, search } = useLocation();

  if (failure !== "unavailable") {
    return <GenericError error={undefined} />;
  }

  return (
    <Section
      width="fixed"
      verticalPadding="large"
      containerClassName="space-y-4 flex justify-center items-center flex-col text-center"
    >
      <h4 className="font-medium">This page is temporarily unavailable.</h4>
      <p>We couldn’t load this page right now. Please try again in a moment.</p>
      {/* A plain anchor: a full document request, not a client navigation
          that would replay the same failed data request. */}
      <a
        href={`${pathname}${search}`}
        className={cn(variants({ variant: "outline" }), "w-fit")}
      >
        Reload page
      </a>
    </Section>
  );
}

export function GenericError({
  error,
}: {
  error: { message: string; stack?: string } | unknown;
}) {
  const heading = "Something's wrong here.";
  let description = "We found an error while loading this page.";

  // TODO hide error in prod?
  if (error && typeof error === "object" && "message" in error) {
    description += `\n${(error as { message: string }).message}`;
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
      {error &&
        typeof error === "object" &&
        "stack" in error &&
        typeof (error as { stack?: string }).stack === "string" && (
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
              __html: addLinksToStackTrace((error as { stack: string }).stack),
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
