import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import { Heading, IconCaret, IconClose } from "~/modules";
import { cn } from "~/lib/cn";
import clsx from "clsx";

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left, top
 * @param children - react children node.
 */
export function Drawer({
  heading,
  open,
  onClose,
  openFrom = "right",
  children,
  isBackMenu = false,
  bordered = false
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: "right" | "left" | "top";
  isBackMenu?: boolean;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  const offScreen = {
    right: "translate-x-full",
    left: "-translate-x-full",
    top: "-translate-y-full",
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className={
        clsx(
          "relative",
          openFrom === "top" ? "z-10" : "z-50", 
        )
      } onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 left-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 top-nav bg-primary bg-opacity-25 text-body" />
        </Transition.Child>

        <div className="fixed inset-0 top-nav">
          <div className="absolute inset-0 top-nav overflow-hidden">
            <div
              className={`fixed inset-y-0 flex max-w-full ${
                openFrom === "right" ? "right-0" : openFrom === "top" ? "top-nav" : ""
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={offScreen[openFrom]}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={offScreen[openFrom]}
              >
                <Dialog.Panel
                  className={cn(
                    "w-screen text-left align-middle transition-all transform shadow-xl  bg-primary",
                    openFrom === "top" ? "h-fit" : "max-w-lg h-screen-dynamic",
                  )}
                >
                  {openFrom !== 'top' && <header
                    className={clsx(
                      "sticky top-0 flex items-center px-6 sm:px-8 md:px-12 h-nav",
                      isBackMenu ? "justify-start gap-4" : heading ? "justify-between" : "justify-end",
                      bordered && "border-b"
                    )}
                  >
                    {isBackMenu && (
                      <button
                        type="button"
                        className="p-2 -m-4 transition text-body hover:text-body/50"
                        onClick={onClose}
                        data-test="close-cart"
                      >
                        <IconCaret className="w-6 h-6" direction="left" aria-label="Close panel" />
                      </button>
                    )}
                    {heading !== null && (
                      <Dialog.Title>
                        <Heading as="span" size="lead" id="cart-contents">
                          {heading}
                        </Heading>
                      </Dialog.Title>
                    )}
                    {!isBackMenu && (
                      <button
                        type="button"
                        className="p-4 -m-4 transition text-body hover:text-body/50"
                        onClick={onClose}
                        data-test="close-cart"
                      >
                        <IconClose aria-label="Close panel" />
                      </button>
                    )}
                  </header>}
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = Dialog.Title;

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault);

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
