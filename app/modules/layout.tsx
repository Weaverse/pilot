import { DesktopHeader } from "~/components/header/desktop-header";
import { MobileHeader } from "~/components/header/mobile-header";
import { ScrollingAnnouncement } from "~/components/header/scrolling-announcement";
import { Footer } from "./footer";

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <ScrollingAnnouncement />
        <DesktopHeader />
        <MobileHeader />
        <main id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
