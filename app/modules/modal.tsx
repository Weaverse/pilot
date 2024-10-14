import { useEffect } from "react";
import Button from "~/components/button";
import { IconX } from "~/components/icons";
import { Link } from "~/components/link";

/**
 * @deprecated use `~/components/modal` instead
 */
export function Modal({
  children,
  cancelLink,
  onClose,
}: {
  children: React.ReactNode;
  cancelLink: string;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!document.body.classList.contains("overflow-hidden")) {
      document.body.classList.add("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      id="modal-bg"
    >
      <div className="fixed inset-0 transition-opacity bg-opacity-75 bg-background/40" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div
            className="relative flex-1 px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded shadow-xl sm:my-12 sm:flex-none sm:p-6 max-w-[446px] w-screen bg-background"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyPress={(e) => {
              e.stopPropagation();
            }}
            tabIndex={0}
          >
            <div className="absolute top-0 right-0 hidden pr-4 sm:block">
              {cancelLink ? (
                <Link
                  to={cancelLink}
                  className="-m-4 transition text-body hover:text-body/50"
                >
                  <IconX aria-label="Close panel" className="w-4 h-4" />
                </Link>
              ) : (
                <Button variant="link" onClick={onClose}>
                  <IconX aria-label="Close panel" className="w-4 h-4" />
                </Button>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
