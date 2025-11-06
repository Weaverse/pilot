import { CaretRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import { cn } from "~/utils/cn";

export function MobileMenu() {
  const { headerMenu } = useShopMenu();

  if (!headerMenu) {
    return <MenuTrigger />;
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild
        className="relative flex h-8 w-8 items-center justify-center focus-visible:outline-hidden lg:hidden"
      >
        <MenuTrigger />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-10 bg-black/50",
            "data-[state=open]:animate-[fade-in_150ms_ease-out]",
            "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
          )}
        />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn([
            "fixed inset-0 z-10 h-screen bg-(--color-header-bg) pt-4 pb-2",
            "data-[state=open]:animate-[enter-from-left_200ms_ease-out]",
            "data-[state=closed]:animate-[exit-to-left_200ms_ease-in]",
            "focus-visible:outline-hidden",
          ])}
          aria-describedby={undefined}
        >
          <Dialog.Title asChild>
            <div className="px-4">Menu</div>
          </Dialog.Title>
          <Dialog.Close asChild>
            <XIcon className="fixed top-4 right-4 h-5 w-5" />
          </Dialog.Close>
          <div className="mt-4 border-line-subtle border-t" />
          <div className="py-2">
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-1 px-4">
                {headerMenu.items.map((item) => (
                  <CollapsibleMenuItem
                    key={item.id}
                    item={item as unknown as SingleMenuItem}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CollapsibleMenuItem({ item }: { item: SingleMenuItem }) {
  const { title, to, items } = item;

  if (!items?.length) {
    return (
      <Dialog.Close asChild>
        <Link to={to} className="py-3">
          {title}
        </Link>
      </Dialog.Close>
    );
  }

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className='flex w-full items-center justify-between gap-4 py-3 data-[state="open"]:[&>svg]:rotate-90'
        >
          <span>{title}</span>
          <CaretRightIcon className="h-4 w-4" />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col border-gray-300 border-l pl-4">
        {items.map((childItem) => (
          <CollapsibleMenuItem key={childItem.id} item={childItem} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function MenuTrigger(
  props: Dialog.DialogTriggerProps & { ref?: React.Ref<HTMLButtonElement> },
) {
  const { ref, ...rest } = props;
  return (
    <button ref={ref} type="button" {...rest}>
      <ListIcon className="h-5 w-5" />
    </button>
  );
}
