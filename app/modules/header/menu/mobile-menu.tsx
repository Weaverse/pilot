import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import clsx from "clsx";
import { IconCaretDown, IconCaretRight } from "~/components/icons";
import { getMaxDepth } from "~/lib/menu";
import type { SingleMenuItem } from "~/lib/type";
import type { EnhancedMenu } from "~/lib/utils";
import { Drawer, useDrawer } from "~/modules/drawer";

export function MobileMenu({ menu }: { menu: EnhancedMenu }) {
  let items = menu.items as unknown as SingleMenuItem[];
  return (
    <nav className="grid px-4 py-2 w-[360px]">
      {items.map((item, id) => {
        let { title, ...rest } = item;
        let level = getMaxDepth(item);
        let isResourceType =
          item.items.length &&
          item.items.every((item) => item?.resource !== null);
        let Comp: React.FC<SingleMenuItem> = isResourceType
          ? ImageMenu
          : level > 2
            ? MultiMenu
            : level === 2
              ? SingleMenu
              : ItemHeader;
        return <Comp key={id} title={title} {...rest} />;
      })}
    </nav>
  );
}

function MultiMenu(props: SingleMenuItem) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let { title, to, items } = props;
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
      spacing="sm"
    >
      <div className="grid px-4 py-2 overflow-auto w-[360px]">
        {items.map((item, id) => (
          <div key={id}>
            <Disclosure>
              {({ open }) => (
                <>
                  <DisclosureButton className="text-left w-full">
                    <h5 className="flex justify-between py-3 w-full uppercase font-medium">
                      <Link to={item.to} prefetch="intent">
                        {item.title}
                      </Link>
                      {item?.items?.length > 0 && (
                        <span className="md:hidden">
                          {open ? (
                            <IconCaretDown className="w-4 h-4" />
                          ) : (
                            <IconCaretRight className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </h5>
                  </DisclosureButton>
                  {item?.items?.length > 0 ? (
                    <div
                      className={clsx(
                        "overflow-hidden transition-all duration-300",
                        open ? "max-h-48 h-fit" : "max-h-0 md:max-h-fit",
                      )}
                    >
                      <DisclosurePanel static>
                        <ul className="space-y-3 pb-3 pt-2">
                          {item.items.map((subItem, ind) => (
                            <li key={ind} className="leading-6">
                              <Link key={ind} to={subItem.to} prefetch="intent">
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </DisclosurePanel>
                    </div>
                  ) : null}
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Drawer>
  );
  return (
    <div className="">
      <div
        className="flex justify-between items-center py-3"
        role="button"
        onClick={openMenu}
      >
        <Link to={to} prefetch="intent">
          <span className="uppercase font-medium">{title}</span>
        </Link>
        <IconCaretRight className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}

function ImageMenu({ title, items, to }: SingleMenuItem) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
      spacing="sm"
    >
      <div className="grid px-4 py-5 gap-3 grid-cols-2 w-[360px]">
        {items.map((item, id) => (
          <Link to={item.to} prefetch="intent" key={id}>
            <div className="w-full aspect-square relative">
              <Image
                data={item.resource?.image}
                className="w-full h-full object-cover"
                sizes="auto"
              />
              <div className="absolute w-full inset-0 text-center text-white font-medium pointer-events-none p-2 bg-black/15 group-hover/item:bg-black/30 flex items-center justify-center">
                {item.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Drawer>
  );
  return (
    <div className="">
      <div
        className="flex justify-between items-center py-3"
        role="button"
        onClick={openMenu}
      >
        <Link to={to} prefetch="intent">
          <span className="uppercase font-medium">{title}</span>
        </Link>
        <IconCaretRight className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}

function SingleMenu(props: SingleMenuItem) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let { title, items, to } = props;
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
      spacing="sm"
    >
      <div className="grid px-4 py-2 overflow-auto w-[360px]">
        <ul className="space-y-3 pb-3 pt-2">
          {items.map((subItem, ind) => (
            <li key={ind} className="leading-6">
              <Link key={ind} to={subItem.to} prefetch="intent">
                {subItem.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
  return (
    <div className="">
      <div
        className="flex justify-between items-center py-3"
        role="button"
        onClick={openMenu}
      >
        <Link to={to} prefetch="intent">
          <span className="uppercase font-medium">{title}</span>
        </Link>
        <IconCaretRight className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}

function ItemHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex justify-between items-center py-3">
      <Link to={to} prefetch="intent">
        <span className="uppercase font-medium">{title}</span>
      </Link>
    </div>
  );
}
