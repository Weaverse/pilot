import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useLocation } from "@remix-run/react";
import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { IconCaretLeft, IconX } from "~/components/icons";
import { cn } from "~/lib/cn";

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left, top
 * @param children - react children node.
 */
const DRAWER_HEADER_SPACING = {
  sm: "px-4",
  md: "px-5",
  lg: "px-6",
};

export function Drawer({
  heading,
  open,
  onClose,
  openFrom = "right",
  children,
  isBackMenu = false,
  bordered = false,
  spacing = "md",
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: "right" | "left" | "top";
  isBackMenu?: boolean;
  bordered?: boolean;
  spacing?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) {
  let offScreen = {
    right: "translate-x-full",
    left: "-translate-x-full",
    top: "-translate-y-full",
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 left-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-body bg-opacity-50 text-body" />
        </TransitionChild>
        <div className="fixed inset-0 top-nav">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={clsx(
                "fixed inset-y-0 flex",
                openFrom === "right" && "right-0 max-w-full",
                openFrom === "top" && "overflow-hidden w-screen",
              )}
            >
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={offScreen[openFrom]}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={offScreen[openFrom]}
              >
                <DialogPanel
                  className={cn(
                    "text-left align-middle transition-transform transform shadow-xl bg-background",
                    openFrom === "top"
                      ? "h-fit w-screen"
                      : "max-w-lg h-screen-dynamic",
                  )}
                >
                  {openFrom !== "top" && (
                    <header
                      className={clsx(
                        "sticky top-0 flex items-center h-nav",
                        DRAWER_HEADER_SPACING[spacing],
                        isBackMenu
                          ? "justify-start gap-4"
                          : heading
                            ? "justify-between"
                            : "justify-end",
                        bordered && "border-b",
                      )}
                    >
                      {isBackMenu && (
                        <button
                          type="button"
                          className="p-2 -m-4 transition text-body hover:text-body/50"
                          onClick={onClose}
                          data-test="close-cart"
                        >
                          <IconCaretLeft
                            className="w-4 h-4"
                            aria-label="Close panel"
                          />
                        </button>
                      )}
                      {heading !== null && (
                        <DialogTitle as="h5">{heading}</DialogTitle>
                      )}
                      {!isBackMenu && (
                        <button
                          type="button"
                          className="transition text-body hover:text-body/50"
                          onClick={onClose}
                          data-test="close-cart"
                        >
                          <IconX aria-label="Close panel" className="w-5 h-5" />
                        </button>
                      )}
                    </header>
                  )}
                  {children}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = DialogTitle;

export function useDrawer(openDefault = false) {
  let [isOpen, setIsOpen] = useState(openDefault);
  let { pathname } = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isOpen) {
      closeDrawer();
    }
  }, [pathname]);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  };
}
