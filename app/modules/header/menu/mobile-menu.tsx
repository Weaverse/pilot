import { CaretRight, List, X } from "@phosphor-icons/react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouteLoaderData } from "@remix-run/react";
import { forwardRef } from "react";
import Link from "~/components/link";
import { cn } from "~/lib/cn";
import type { SingleMenuItem } from "~/lib/type";
import type { EnhancedMenu } from "~/lib/utils";
import type { RootLoader } from "~/root";

export function MobileMenu() {
  let data = useRouteLoaderData<RootLoader>("root");
  let menu = data?.layout?.headerMenu as EnhancedMenu;

  if (!menu) return <MenuTrigger />;

  return (
    <Dialog.Root>
      <Dialog.Trigger
        asChild
        className="relative flex items-center justify-center w-8 h-8 focus-visible:outline-none"
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
            "fixed inset-0 bg-[--color-background] p-4 z-10",
            "left-0 -translate-x-full data-[state=open]:animate-enter-from-left",
            "focus-visible:outline-none",
            "uppercase",
          ])}
          style={
            { "--enter-from-left-duration": "200ms" } as React.CSSProperties
          }
        >
          <Dialog.Close asChild>
            <X className="w-5 h-5 fixed top-4 right-4" />
          </Dialog.Close>
          <div>Menu</div>
          <div className="mt-4 mb-2 -mx-4 border-t border-line-subtle" />
          <div className="space-y-1">
            {menu.items.map((item) => (
              <CollapsibleMenuItem
                key={item.id}
                item={item as unknown as SingleMenuItem}
              />
            ))}
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
  },
);
