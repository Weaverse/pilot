import { Icon, type IconName } from "~/components/icon";
import Link from "~/components/link";

interface SocialLinksProps {
  socialInstagram: string;
  socialX: string;
  socialLinkedIn: string;
  socialFacebook: string;
}

export function SocialLinks({
  socialInstagram,
  socialX,
  socialLinkedIn,
  socialFacebook,
}: SocialLinksProps) {
  const accounts = [
    { name: "Instagram", to: socialInstagram, icon: "instagram-logo" },
    { name: "X", to: socialX, icon: "x-logo" },
    { name: "LinkedIn", to: socialLinkedIn, icon: "linkedin-logo" },
    { name: "Facebook", to: socialFacebook, icon: "facebook-logo" },
  ].filter((acc) => acc.to && acc.to.trim() !== "") as {
    name: string;
    to: string;
    icon: IconName;
  }[];

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {accounts.map(({ to, name, icon }) => (
        <Link
          key={name}
          to={to}
          target="_blank"
          className="flex items-center gap-2 text-lg"
        >
          <Icon name={icon} className="size-6" />
        </Link>
      ))}
    </div>
  );
}
