import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";
import { useFetcher, useLocation, useRouteLoaderData } from "react-router";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { useWeaverseStudioCheck } from "~/hooks/use-weaverse-studio-check";
import type { RootLoader } from "~/root";
import type { ThemeSettings } from "~/types/weaverse";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";

const POPUP_DISMISSED_KEY = "newsletter-popup-dismissed";

export function useShouldRenderNewsletterPopup() {
  const location = useLocation();
  const data = useRouteLoaderData<RootLoader>("root");
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;
  const { newsletterPopupEnabled, newsletterPopupHomeOnly } =
    useThemeSettings<ThemeSettings>();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const isHomePage =
    pathParts.length === 0 ||
    (pathParts.length === 1 && pathParts[0] === locale.pathPrefix.slice(1));
  return (
    newsletterPopupEnabled && (newsletterPopupHomeOnly ? isHomePage : true)
  );
}

export function NewsletterPopup() {
  const {
    newsletterPopupType = "popup",
    newsletterPopupDelay,
    newsletterPopupAllowDismiss,
    newsletterPopupImage,
    newsletterPopupImagePosition = "left",
    newsletterPopupHeading,
    newsletterPopupDescription,
    newsletterPopupButtonText,
    newsletterPopupPosition = "bottom-right",
  } = useThemeSettings<ThemeSettings>();

  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<{ ok: boolean; error: string }>();
  const isDesignMode = useWeaverseStudioCheck();
  const isModal = newsletterPopupType === "modal";

  // Compute message and error from fetcher data
  const message = fetcher.data?.ok ? "Thank you for signing up! 🎉" : "";
  const error =
    fetcher.data && !fetcher.data.ok
      ? fetcher.data.error || "An error occurred while signing up."
      : "";

  // Close popup after successful submission
  useEffect(() => {
    if (fetcher.data?.ok) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: just need to run once
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isDesignMode) {
      const isDismissed = localStorage.getItem(POPUP_DISMISSED_KEY) === "true";
      if (isDismissed) {
        return;
      }
      timer = setTimeout(() => {
        setOpen(true);
      }, newsletterPopupDelay * 1000);
    }
    return () => clearTimeout(timer);
  }, []);

  // Re-open popup when settings change in design mode
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to track all settings changes in design mode
  useEffect(() => {
    if (isDesignMode) {
      setOpen(true);
    }
  }, [
    newsletterPopupType,
    newsletterPopupDelay,
    newsletterPopupAllowDismiss,
    newsletterPopupImage,
    newsletterPopupImagePosition,
    newsletterPopupHeading,
    newsletterPopupDescription,
    newsletterPopupButtonText,
    newsletterPopupPosition,
  ]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={isModal}>
      <Dialog.Portal>
        {isModal && (
          <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
        )}
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={!isModal ? (e) => e.preventDefault() : undefined}
          className={cn(
            "fixed z-50 data-[state=open]:animate-slide-up",
            isModal
              ? "inset-0 flex items-center justify-center p-4 [--slide-up-from:20px]"
              : cn(
                  "p-8 [--slide-up-from:12px]",
                  newsletterPopupPosition === "top-left" && "top-0 left-0",
                  newsletterPopupPosition === "top-right" && "top-0 right-0",
                  newsletterPopupPosition === "bottom-left" &&
                    "bottom-0 left-0",
                  newsletterPopupPosition === "bottom-right" &&
                    "bottom-0 right-0",
                ),
          )}
          aria-describedby={undefined}
        >
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-lg bg-white",
              isModal
                ? cn("max-w-md", newsletterPopupImage && "lg:max-w-2xl")
                : cn(
                    "border border-gray-300 shadow-2xl",
                    newsletterPopupImage && "lg:max-w-lg",
                  ),
            )}
          >
            <VisuallyHidden.Root asChild>
              <Dialog.Title>Newsletter Signup</Dialog.Title>
            </VisuallyHidden.Root>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-2xl bg-white/80 border border-gray-300 backdrop-blur transition-colors hover:bg-gray-100 focus-visible:outline-0"
                aria-label="Close"
              >
                <XIcon size={14} />
              </button>
            </Dialog.Close>

            <div
              className={cn(
                "flex",
                newsletterPopupImagePosition === "top"
                  ? "flex-col"
                  : "flex-col md:flex-row",
                newsletterPopupImagePosition === "right" &&
                  "md:flex-row-reverse",
              )}
            >
              {newsletterPopupImage && (
                <div
                  className={cn(
                    "relative",
                    newsletterPopupImagePosition === "top"
                      ? "h-48 w-full"
                      : "h-48 w-full md:h-auto md:w-1/2",
                    !isModal &&
                      newsletterPopupImagePosition === "top" &&
                      "h-36 lg:h-48",
                  )}
                >
                  <Image
                    data={newsletterPopupImage}
                    sizes={
                      isModal
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 100vw, 25vw"
                    }
                  />
                </div>
              )}
              <div
                className={cn(
                  "flex flex-col justify-center p-6",
                  !isModal && "p-5",
                  newsletterPopupImage
                    ? newsletterPopupImagePosition === "top"
                      ? "w-full"
                      : "md:w-1/2"
                    : "w-full",
                )}
              >
                <h3
                  className={cn(
                    "mb-4 font-medium text-2xl",
                    !isModal && "mb-3 text-2xl",
                  )}
                >
                  {newsletterPopupHeading}
                </h3>
                <p className={cn("mb-6 text-body-subtle", !isModal && "mb-4")}>
                  {newsletterPopupDescription}
                </p>

                <fetcher.Form
                  action="/api/klaviyo"
                  method="POST"
                  encType="multipart/form-data"
                  className="space-y-3"
                >
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    loading={fetcher.state === "submitting"}
                  >
                    {newsletterPopupButtonText}
                  </Button>
                </fetcher.Form>

                {error && (
                  <Banner variant="error" className="mt-4">
                    {error}
                  </Banner>
                )}
                {message && (
                  <Banner variant="success" className="mt-4">
                    {message}
                  </Banner>
                )}

                {newsletterPopupAllowDismiss && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem(POPUP_DISMISSED_KEY, "true");
                      setOpen(false);
                    }}
                    className="mt-4 text-body-subtle text-sm underline underline-offset-4 hover:text-body"
                  >
                    Don't show this again
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
