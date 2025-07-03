import type { CustomerDetailsFragment } from "customer-account-api.generated";
import { Link } from "~/components/link";

export function AccountDetails({
  customer,
}: {
  customer: CustomerDetailsFragment;
}) {
  const { firstName, lastName, emailAddress, phoneNumber } = customer;
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  return (
    <div className="space-y-4">
      <div className="font-bold">Account</div>
      <div className="space-y-4 border border-line-subtle p-5">
        <div className="space-y-1">
          <div className="text-body-subtle">Name</div>
          <div>{fullName || "N/A"}</div>
        </div>

        <div className="space-y-1">
          <div className=" text-body-subtle">Phone number</div>
          <div>{phoneNumber?.phoneNumber ?? "N/A"}</div>
        </div>

        <div className="space-y-1">
          <div className=" text-body-subtle">Email address</div>
          <div>{emailAddress?.emailAddress ?? "N/A"}</div>
        </div>

        <div>
          <Link
            prefetch="intent"
            variant="underline"
            className="text-body-subtle after:bg-body-subtle"
            to="/account/edit"
          >
            Edit account details
          </Link>
        </div>
      </div>
    </div>
  );
}
