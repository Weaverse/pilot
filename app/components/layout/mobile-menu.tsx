import { CaretRight, List, X } from "@phosphor-icons/react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import Link from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { cn } from "~/utils/cn";
import type { SingleMenuItem } from "~/types/menu";

export function MobileMenu() {
  let { headerMenu } = useShopMenu();

  if (!headerMenu) return <MenuTrigger />;

  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild
        className="relative flex lg:hidden items-center justify-center w-8 h-8 focus-visible:outline-none"
      >
        <MenuTrigger />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in z-10"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={cn([
            "fixed inset-0 h-screen-dynamic bg-[--color-header-bg] pt-4 pb-2 z-10",
            "left-0 -translate-x-full data-[state=open]:animate-enter-from-left",
            "focus-visible:outline-none",
            "uppercase",
          ])}
          style={
            { "--enter-from-left-duration": "200ms" } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <Dialog.Title asChild>
            <div className="px-4">Menu</div>
          </Dialog.Title>
          <Dialog.Close asChild>
            <X className="w-5 h-5 fixed top-4 right-4" />
          </Dialog.Close>
          <div className="mt-4 border-t border-line-subtle" />
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
  let { title, to, items } = item;

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
        <button className='py-3 w-full flex items-center gap-4 justify-between [&>svg]:data-[state="open"]:rotate-90'>
          <span className="uppercase">{title}</span>
          <CaretRight className="w-4 h-4" />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pl-4 border-l border-gray-300">
        {items.map((item) => (
          <CollapsibleMenuItem key={item.id} item={item} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

let MenuTrigger = forwardRef<HTMLButtonElement, Dialog.DialogTriggerProps>(
  (props, ref) => {
    return (
      <button ref={ref} type="button" {...props}>
        <List className="w-5 h-5" />
      </button>
    );
  }
);
