import { cn } from "~/utils/cn";
import { Link } from "./link";

export function BreadCrumb({
  homeLabel = "Home",
  page,
  className,
}: {
  homeLabel?: string;
  page: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-body-subtle", className)}>
      <Link to="/" className="underline-offset-4 hover:underline">
        {homeLabel}
      </Link>
      <span>/</span>
      <span>{page}</span>
    </div>
  );
}
