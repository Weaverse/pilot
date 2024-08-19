import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import clsx from "clsx";
import { IconX } from "~/components/icons";
import { Link } from "~/components/link";

export function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure
      key={title}
      as="div"
      className="grid w-full gap-2 py-4 border-b border-line"
    >
      {({ open }) => (
        <>
          <DisclosureButton className="text-left">
            <div className="flex justify-between">
              <p>{title}</p>
              <IconX
                className={clsx(
                  "transition-transform transform-gpu duration-200 w-4 h-4",
                  !open && "rotate-[45deg]",
                )}
              />
            </div>
          </DisclosureButton>
          <DisclosurePanel className={"pb-4 pt-2 grid gap-2"}>
            <div
              suppressHydrationWarning
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-line/30 text-body/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
