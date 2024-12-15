import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import { ScrollingAnnouncement } from "~/components/header/scrolling-announcement";

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
        <Header />
        <main id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
