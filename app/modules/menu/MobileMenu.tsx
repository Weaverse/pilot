import { Disclosure } from "@headlessui/react";
import { Link } from "@remix-run/react";
import { Image } from "@shopify/hydrogen";
import { IconCaret, IconCaretDown, IconCaretRight } from "~/components/Icons";
import { Drawer, useDrawer } from "../Drawer";
import {
  Nav_Items,
  type ImageItem,
  type MultiMenuProps,
  type SingleMenuProps,
} from "./defines";

const MenuByType = {
  multi: MultiMenu,
  image: ImageMenu,
  single: SingleMenu,
};

export function MobileMenu() {
  return (
    <nav className="grid px-4 py-2">
      {Nav_Items.map((item, id) => {
        let { title, type, ...rest } = item;
        let Comp = MenuByType[type];
        return <Comp key={id} title={title} {...rest} />;
      })}
    </nav>
  );
}

function MultiMenu(props: MultiMenuProps) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let { title, items } = props;
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
    >
      <div className="grid px-4 py-2 overflow-auto">
        {items.map((item, id) => (
          <div key={id}>
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="text-left w-full">
                    <h5 className="flex justify-between py-3 w-full uppercase font-medium">
                      {item.title}
                      <span className="md:hidden">
                        {open ? (
                          <IconCaretDown className="w-4 h-4" />
                        ) : (
                          <IconCaretRight className="w-4 h-4" />
                        )}
                      </span>
                    </h5>
                  </Disclosure.Button>
                  {item?.items?.length > 0 ? (
                    <div
                      className={`${
                        open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                    >
                      <Disclosure.Panel static>
                        <ul className="space-y-3 pb-3 pt-2">
                          {item.items.map((subItem, ind) => (
                            <li key={ind} className="leading-6">
                              <Link
                                key={ind}
                                to={subItem.to}
                                prefetch="intent"
                                className="animate-hover"
                              >
                                {subItem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Disclosure.Panel>
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
        <span className="uppercase font-medium">{title}</span>{" "}
        <IconCaret className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}

function ImageMenu({
  title,
  imageItems,
}: {
  title: string;
  imageItems: ImageItem[];
}) {
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
    >
      <div className="grid px-4 py-5 gap-3 grid-cols-2">
        {imageItems.map((item, id) => (
          <Link to={item.to} prefetch="intent" key={id}>
            <div className="w-full aspect-square relative">
              <Image
                data={item.data}
                className="w-full h-full object-cover"
                sizes="auto"
              />
              <div className="absolute w-full top-1/2 left-0 text-center -translate-y-1/2 text-white font-medium pointer-events-none">
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
        <span className="uppercase font-medium">{title}</span>{" "}
        <IconCaret className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}

function SingleMenu(props: SingleMenuProps) {
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  let { title, items } = props;
  let content = (
    <Drawer
      open={isMenuOpen}
      onClose={closeMenu}
      openFrom="left"
      heading={title}
      isBackMenu
      bordered
    >
      <div className="grid px-4 py-2 overflow-auto">
        <ul className="space-y-3 pb-3 pt-2">
          {items.map((subItem, ind) => (
            <li key={ind} className="leading-6">
              <Link
                key={ind}
                to={subItem.to}
                prefetch="intent"
                className="animate-hover"
              >
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
        <span className="uppercase font-medium">{title}</span>{" "}
        <IconCaret className="w-4 h-4" />
      </div>
      {content}
    </div>
  );
}
