import {
  FacebookLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
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
    { name: "Instagram", to: socialInstagram, Icon: InstagramLogoIcon },
    { name: "X", to: socialX, Icon: XLogoIcon },
    { name: "LinkedIn", to: socialLinkedIn, Icon: LinkedinLogoIcon },
    { name: "Facebook", to: socialFacebook, Icon: FacebookLogoIcon },
  ].filter((acc) => acc.to && acc.to.trim() !== "");

  if (accounts.length === 0) return null;

  return (
    <div className="flex gap-4">
      {accounts.map(({ to, name, Icon }) => (
        <Link
          key={name}
          to={to}
          target="_blank"
          className="flex items-center gap-2 text-lg"
        >
          <Icon className="h-5 w-5" />
        </Link>
      ))}
    </div>
  );
}
