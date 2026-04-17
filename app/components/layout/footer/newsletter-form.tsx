import { useFetcher } from "react-router";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";

interface NewsletterFormProps {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  inputWidth: number;
}

export function NewsletterForm({
  title,
  description,
  placeholder,
  buttonText,
  inputWidth,
}: NewsletterFormProps) {
  const fetcher = useFetcher<{ ok: boolean; error: string }>();

  const message = fetcher.data?.ok ? "Thank you for signing up! 🎉" : "";
  const error =
    fetcher.data && !fetcher.data.ok
      ? fetcher.data.error || "An error occurred while signing up."
      : "";

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base">{title}</h3>
      <div className="space-y-2">
        <p>{description}</p>
        <fetcher.Form
          action="/api/klaviyo"
          method="POST"
          encType="multipart/form-data"
        >
          <div
            className="flex overflow-hidden rounded-md border border-gray-100"
            style={{ maxWidth: inputWidth }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder={placeholder}
              className="grow rounded-none border-none px-3 focus-visible:outline-hidden focus:ring-0"
            />
            <Button
              variant="custom"
              type="submit"
              className="rounded-none border-y-0 border-r-0"
              loading={fetcher.state === "submitting"}
            >
              {buttonText}
            </Button>
          </div>
        </fetcher.Form>
        <div className="h-8">
          {message && (
            <Banner variant="success" className="mb-6">
              {message}
            </Banner>
          )}
          {error && (
            <Banner variant="error" className="mb-6">
              {error}
            </Banner>
          )}
        </div>
      </div>
    </div>
  );
}
