import type { CustomerDetailsFragment } from "customer-accountapi.generated";
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
      <div className="p-5 border border-[#B7B7B7] rounded-sm">
        <div className="text-body/50">Name</div>
        <p className="mt-1">{fullName || "N/A"}</p>

        <div className="mt-4 text-body/50">Phone number</div>
        <p className="mt-1">{phoneNumber?.phoneNumber ?? "N/A"}</p>

        <div className="mt-4 text-body/50">Email address</div>
        <p className="mt-1">{emailAddress?.emailAddress ?? "N/A"}</p>
        <p className="mt-3">
          <Link
            prefetch="intent"
            className="underline font-normal text-body/50"
            to="/account/edit"
          >
            Edit
          </Link>
        </p>
      </div>
    </div>
  );
}
