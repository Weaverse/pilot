import { cn } from "~/lib/cn";

type IconProps = JSX.IntrinsicElements["svg"] & {
  direction?: "up" | "right" | "down" | "left";
};

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
function Icon({
  children,
  className,
  fill = "currentColor",
  stroke,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      {...props}
      fill={fill}
      stroke={stroke}
      className={cn("w-5 h-5", className)}
    >
      {children}
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconMenu(props: IconProps) {
  return (
    <Icon {...props} stroke={props.stroke || "currentColor"}>
      <title>Menu</title>
      <line x1="3" y1="6.375" x2="17" y2="6.375" strokeWidth="1.25" />
      <line x1="3" y1="10.375" x2="17" y2="10.375" strokeWidth="1.25" />
      <line x1="3" y1="14.375" x2="17" y2="14.375" strokeWidth="1.25" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconClose(props: IconProps) {
  return (
    <Icon {...props} stroke={props.stroke || "currentColor"}>
      <title>Close</title>
      <line
        x1="4.44194"
        y1="4.30806"
        x2="15.7556"
        y2="15.6218"
        strokeWidth="1.25"
      />
      <line
        y1="-0.625"
        x2="16"
        y2="-0.625"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 16 4.75)"
        strokeWidth="1.25"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconArrow({ direction = "right" }: IconProps) {
  let rotate;

  switch (direction) {
    case "right":
      rotate = "rotate-0";
      break;
    case "left":
      rotate = "rotate-180";
      break;
    case "up":
      rotate = "-rotate-90";
      break;
    case "down":
      rotate = "rotate-90";
      break;
    default:
      rotate = "rotate-0";
  }

  return (
    <Icon className={`w-5 h-5 ${rotate}`}>
      <title>Arrow</title>
      <path d="M7 3L14 10L7 17" strokeWidth="1.25" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconCaret({
  direction = "down",
  stroke = "currentColor",
  ...props
}: IconProps) {
  let rotate;

  switch (direction) {
    case "down":
      rotate = "rotate-0";
      break;
    case "up":
      rotate = "rotate-180";
      break;
    case "right":
      rotate = "-rotate-90";
      break;
    case "left":
      rotate = "rotate-90";
      break;
    default:
      rotate = "rotate-0";
  }

  return (
    <Icon
      {...props}
      className={`w-5 h-5 transition ${rotate}`}
      fill="transparent"
      stroke={stroke}
    >
      <title>Caret</title>
      <path d="M14 8L10 12L6 8" strokeWidth="1.25" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconSelect(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Select</title>
      <path d="M7 8.5L10 6.5L13 8.5" strokeWidth="1.25" />
      <path d="M13 11.5L10 13.5L7 11.5" strokeWidth="1.25" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconBag(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 23 23">
      <title>Bag</title>
      <path d="M21.5525 17.7998L20.2714 7.01859C20.2298 6.66732 20.0602 6.3437 19.795 6.10965C19.5298 5.8756 19.1876 5.74755 18.8339 5.75H15.8124C15.8124 4.60625 15.3581 3.50935 14.5493 2.7006C13.7406 1.89185 12.6437 1.4375 11.4999 1.4375C10.3562 1.4375 9.25927 1.89185 8.45052 2.7006C7.64177 3.50935 7.18742 4.60625 7.18742 5.75H4.16238C3.80867 5.74755 3.46647 5.8756 3.20126 6.10965C2.93604 6.3437 2.76643 6.66732 2.72488 7.01859L1.44371 17.7998C1.42023 18.0011 1.43955 18.205 1.5004 18.3982C1.56125 18.5914 1.66225 18.7696 1.79679 18.9211C1.93231 19.0732 2.09836 19.195 2.28413 19.2786C2.4699 19.3622 2.67121 19.4057 2.87492 19.4062H20.1177C20.3227 19.4067 20.5253 19.3637 20.7124 19.2801C20.8995 19.1965 21.0667 19.0741 21.203 18.9211C21.3369 18.7693 21.4373 18.591 21.4975 18.3978C21.5577 18.2046 21.5765 18.0008 21.5525 17.7998ZM11.4999 2.875C12.2624 2.875 12.9937 3.1779 13.5328 3.71707C14.072 4.25623 14.3749 4.9875 14.3749 5.75H8.62492C8.62492 4.9875 8.92782 4.25623 9.46699 3.71707C10.0062 3.1779 10.7374 2.875 11.4999 2.875ZM2.87492 17.9688L4.16238 7.1875H18.8446L20.1177 17.9688H2.87492Z" fill="currentColor"/>
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconLogin(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Login</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path
          d="M8,10.6928545 C10.362615,10.6928545 12.4860225,11.7170237 13.9504747,13.3456144 C12.4860225,14.9758308 10.362615,16 8,16 C5.63738499,16 3.51397752,14.9758308 2.04952533,13.3472401 C3.51397752,11.7170237 5.63738499,10.6928545 8,10.6928545 Z"
          fill="currentColor"
        ></path>
        <path
          d="M8,3.5 C6.433,3.5 5.25,4.894 5.25,6.5 C5.25,8.106 6.433,9.5 8,9.5 C9.567,9.5 10.75,8.106 10.75,6.5 C10.75,4.894 9.567,3.5 8,3.5 Z"
          fill="currentColor"
          fillRule="nonzero"
        ></path>
      </g>
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconAccount(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 23 23">
      <title>Account</title>
      <path d="M20.7466 19.0469C19.3783 16.6813 17.2697 14.985 14.8089 14.1809C16.0261 13.4563 16.9718 12.3522 17.5008 11.038C18.0297 9.72389 18.1127 8.27246 17.7369 6.90661C17.3612 5.54077 16.5474 4.33604 15.4207 3.47743C14.2939 2.61882 12.9165 2.15381 11.4999 2.15381C10.0833 2.15381 8.7059 2.61882 7.57916 3.47743C6.45243 4.33604 5.63869 5.54077 5.26292 6.90661C4.88714 8.27246 4.9701 9.72389 5.49907 11.038C6.02803 12.3522 6.97375 13.4563 8.19098 14.1809C5.73016 14.9841 3.62152 16.6804 2.2532 19.0469C2.20303 19.1287 2.16974 19.2197 2.15532 19.3146C2.14089 19.4095 2.14562 19.5063 2.16922 19.5994C2.19282 19.6924 2.23482 19.7798 2.29273 19.8563C2.35064 19.9329 2.42329 19.997 2.50641 20.045C2.58952 20.093 2.6814 20.1239 2.77664 20.1358C2.87188 20.1477 2.96854 20.1405 3.06092 20.1144C3.1533 20.0884 3.23953 20.0441 3.31452 19.9842C3.38951 19.9243 3.45174 19.85 3.49754 19.7656C5.1902 16.8403 8.18199 15.0938 11.4999 15.0938C14.8179 15.0938 17.8097 16.8403 19.5023 19.7656C19.5481 19.85 19.6103 19.9243 19.6853 19.9842C19.7603 20.0441 19.8465 20.0884 19.9389 20.1144C20.0313 20.1405 20.128 20.1477 20.2232 20.1358C20.3184 20.1239 20.4103 20.093 20.4934 20.045C20.5766 19.997 20.6492 19.9329 20.7071 19.8563C20.765 19.7798 20.807 19.6924 20.8306 19.5994C20.8542 19.5063 20.859 19.4095 20.8445 19.3146C20.8301 19.2197 20.7968 19.1287 20.7466 19.0469ZM6.46867 8.625C6.46867 7.62992 6.76375 6.65718 7.31659 5.82979C7.86943 5.00241 8.65521 4.35754 9.57455 3.97673C10.4939 3.59593 11.5055 3.49629 12.4815 3.69043C13.4574 3.88456 14.3539 4.36374 15.0576 5.06737C15.7612 5.771 16.2404 6.66749 16.4345 7.64346C16.6286 8.61942 16.529 9.63104 16.1482 10.5504C15.7674 11.4697 15.1225 12.2555 14.2951 12.8083C13.4678 13.3612 12.495 13.6563 11.4999 13.6563C10.166 13.6548 8.8871 13.1243 7.94387 12.1811C7.00064 11.2378 6.4701 9.95894 6.46867 8.625Z" fill="currentColor"/>
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconHelp(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Help</title>
      <path d="M3.375 10a6.625 6.625 0 1 1 13.25 0 6.625 6.625 0 0 1-13.25 0ZM10 2.125a7.875 7.875 0 1 0 0 15.75 7.875 7.875 0 0 0 0-15.75Zm.699 10.507H9.236V14h1.463v-1.368ZM7.675 7.576A3.256 3.256 0 0 0 7.5 8.67h1.245c0-.496.105-.89.316-1.182.218-.299.553-.448 1.005-.448a1 1 0 0 1 .327.065c.124.044.24.113.35.208.108.095.2.223.272.383.08.154.12.34.12.558a1.3 1.3 0 0 1-.076.471c-.044.131-.11.252-.197.361-.08.102-.174.197-.283.285-.102.087-.212.182-.328.284a3.157 3.157 0 0 0-.382.383c-.102.124-.19.27-.262.438a2.476 2.476 0 0 0-.164.591 6.333 6.333 0 0 0-.043.81h1.179c0-.263.021-.485.065-.668a1.65 1.65 0 0 1 .207-.47c.088-.139.19-.263.306-.372.117-.11.244-.223.382-.34l.35-.306c.116-.11.218-.23.305-.361.095-.139.168-.3.219-.482.058-.19.087-.412.087-.667 0-.35-.062-.664-.186-.942a1.881 1.881 0 0 0-.513-.689 2.07 2.07 0 0 0-.753-.427A2.721 2.721 0 0 0 10.12 6c-.4 0-.764.066-1.092.197a2.36 2.36 0 0 0-.83.536c-.225.234-.4.515-.523.843Z" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconSearch(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 23 23">
      <title>Search</title>
      <path d="M20.6335 19.6164L16.135 15.1189C17.4388 13.5535 18.089 11.5458 17.9502 9.51328C17.8115 7.48078 16.8945 5.58003 15.39 4.20642C13.8855 2.83281 11.9093 2.09211 9.87263 2.1384C7.83592 2.18469 5.89547 3.0144 4.45494 4.45494C3.0144 5.89547 2.18469 7.83592 2.1384 9.87263C2.09211 11.9093 2.83281 13.8855 4.20642 15.39C5.58003 16.8945 7.48078 17.8115 9.51328 17.9502C11.5458 18.089 13.5535 17.4388 15.1189 16.135L19.6164 20.6335C19.6832 20.7003 19.7625 20.7532 19.8498 20.7894C19.937 20.8255 20.0305 20.8441 20.125 20.8441C20.2194 20.8441 20.3129 20.8255 20.4002 20.7894C20.4874 20.7532 20.5667 20.7003 20.6335 20.6335C20.7003 20.5667 20.7532 20.4874 20.7894 20.4002C20.8255 20.3129 20.8441 20.2194 20.8441 20.125C20.8441 20.0305 20.8255 19.937 20.7894 19.8498C20.7532 19.7625 20.7003 19.6832 20.6335 19.6164ZM3.59371 10.0625C3.59371 8.78306 3.9731 7.5324 4.68389 6.46862C5.39469 5.40484 6.40497 4.57572 7.58698 4.08612C8.76899 3.59651 10.0696 3.46841 11.3245 3.71801C12.5793 3.9676 13.7319 4.58369 14.6366 5.48836C15.5412 6.39303 16.1573 7.54566 16.4069 8.80047C16.6565 10.0553 16.5284 11.3559 16.0388 12.5379C15.5492 13.72 14.7201 14.7302 13.6563 15.441C12.5925 16.1518 11.3419 16.5312 10.0625 16.5312C8.34743 16.5293 6.70318 15.8472 5.49046 14.6345C4.27775 13.4217 3.59561 11.7775 3.59371 10.0625Z" fill="currentColor"/>
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconCheck({
  stroke = "currentColor",
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon {...props} fill="transparent" stroke={stroke}>
      <title>Check</title>
      <circle cx="10" cy="10" r="7.25" strokeWidth="1.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m7.04 10.37 2.42 2.41 3.5-5.56"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconXMark({
  stroke = "currentColor",
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon {...props} fill="transparent" stroke={stroke}>
      <title>Delete</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconRemove(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || "currentColor"}>
      <title>Remove</title>
      <path
        d="M4 6H16"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 9V14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 9V14" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5.5 6L6 17H14L14.5 6"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6L8 5C8 4 8.75 3 10 3C11.25 3 12 4 12 5V6"
        strokeWidth="1.25"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconFilters(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || "currentColor"}>
      <title>Filters</title>
      <circle cx="4.5" cy="6.5" r="2" />
      <line x1="6" y1="6.5" x2="14" y2="6.5" />
      <line x1="4.37114e-08" y1="6.5" x2="3" y2="6.5" />
      <line x1="4.37114e-08" y1="13.5" x2="8" y2="13.5" />
      <line x1="11" y1="13.5" x2="14" y2="13.5" />
      <circle cx="9.5" cy="13.5" r="2" />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconPinterest(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || "currentColor"}>
      <path
        d="M11.25 8.25L8.25 21"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.76562 14.6813C5.1148 13.7081 4.70085 12.596 4.55691 11.4342C4.41296 10.2723 4.54302 9.09285 4.93667 7.99026C5.33031 6.88767 5.97662 5.89255 6.82385 5.08455C7.67108 4.27655 8.6957 3.67812 9.8157 3.33715C10.9357 2.99618 12.12 2.92215 13.2737 3.12097C14.4275 3.3198 15.5186 3.78597 16.4599 4.48216C17.4012 5.17836 18.1664 6.08524 18.6943 7.13022C19.2222 8.1752 19.4981 9.32925 19.5 10.5C19.5 14.6438 16.5 17.25 13.5 17.25C10.5 17.25 9.59999 15.2719 9.59999 15.2719"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconFacebook(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || "currentColor"}>
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 8.24999H14.25C13.9542 8.24875 13.6611 8.3061 13.3875 8.41873C13.114 8.53137 12.8654 8.69705 12.6563 8.90623C12.4471 9.11541 12.2814 9.36394 12.1688 9.63749C12.0561 9.91103 11.9988 10.2042 12 10.5V21"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13.5H15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconMapBlank(props: IconProps) {
  return (
    <Icon {...props} fill="none" stroke={props.stroke || "currentColor"}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M171.168 30.3128C171.673 30.4812 172.184 30.6519 172.702 30.8246L184.222 34.6645C188.66 36.1436 192.55 37.44 195.636 38.8757C198.972 40.4278 202.03 42.427 204.367 45.67C206.705 48.913 207.635 52.4459 208.052 56.1018C208.438 59.4836 208.438 63.5839 208.438 68.2621V146.966C208.438 153.66 208.438 159.305 207.919 163.767C207.38 168.403 206.172 172.987 202.793 176.684C200.789 178.877 198.354 180.633 195.64 181.84C191.064 183.876 186.333 183.573 181.764 182.618C177.367 181.699 172.012 179.914 165.662 177.797L165.253 177.661C154.514 174.082 150.835 172.966 147.262 173.088C145.839 173.137 144.424 173.326 143.038 173.654C139.559 174.476 136.302 176.52 126.884 182.799L113.636 191.631C113.182 191.934 112.733 192.234 112.291 192.529C102.118 199.319 95.0431 204.041 86.7721 205.149C78.501 206.256 70.4327 203.562 58.8317 199.688C58.3272 199.519 57.8161 199.349 57.298 199.176L45.778 195.336C41.3399 193.857 37.45 192.561 34.3639 191.125C31.0276 189.573 27.9701 187.574 25.6326 184.331C23.2952 181.088 22.3655 177.555 21.9481 173.899C21.562 170.517 21.5622 166.417 21.5625 161.739L21.5625 83.0345C21.5623 76.3411 21.5621 70.6961 22.081 66.2335C22.6201 61.5972 23.8285 57.0138 27.2067 53.3164C29.2107 51.1233 31.6462 49.3678 34.3605 48.1603C38.9364 46.1246 43.6667 46.4276 48.2356 47.3823C52.6333 48.3012 57.9885 50.0865 64.3383 52.2034L64.7468 52.3396C75.4856 55.9191 79.1654 57.0343 82.7378 56.9124C84.1612 56.8638 85.5762 56.6743 86.9622 56.3466C90.4409 55.5243 93.6976 53.4802 103.116 47.2012L116.364 38.3693C116.818 38.0664 117.267 37.7672 117.709 37.4719C127.882 30.6819 134.957 25.9595 143.228 24.8519C151.499 23.7442 159.567 26.4386 171.168 30.3128ZM150.938 39.344V158.885C156.071 159.441 161.477 161.246 168.6 163.624C168.994 163.755 169.394 163.889 169.799 164.024C176.667 166.313 181.224 167.82 184.705 168.547C188.109 169.258 189.276 168.938 189.797 168.706C190.701 168.304 191.513 167.719 192.181 166.988C192.566 166.567 193.239 165.561 193.64 162.107C194.051 158.575 194.063 153.775 194.063 146.536V68.6388C194.063 63.4727 194.052 60.2017 193.77 57.7323C193.509 55.4466 193.082 54.5968 192.706 54.0752C192.33 53.5536 191.659 52.8798 189.573 51.9094C187.319 50.8611 184.22 49.8164 179.319 48.1828L168.156 44.462C159.662 41.6306 154.623 40.0195 150.938 39.344ZM136.563 160.613V42.4867C133.58 44.21 129.755 46.7184 124.338 50.3301L111.09 59.1619C110.735 59.3988 110.384 59.6325 110.039 59.8633C103.443 64.2647 98.5258 67.5457 93.4375 69.3874V187.514C96.42 185.791 100.245 183.282 105.662 179.671L118.91 170.839C119.265 170.602 119.616 170.368 119.961 170.137C126.557 165.736 131.474 162.455 136.563 160.613ZM79.0625 190.657V71.1158C73.9288 70.5593 68.5228 68.7547 61.3997 66.3769C61.0055 66.2452 60.606 66.1119 60.201 65.9769C53.3332 63.6876 48.7762 62.1808 45.2953 61.4534C41.8916 60.7422 40.7244 61.0625 40.2035 61.2942C39.2987 61.6967 38.4869 62.2819 37.8189 63.0129C37.4344 63.4338 36.7614 64.4398 36.3598 67.8938C35.9491 71.4261 35.9375 76.2257 35.9375 83.465V161.362C35.9375 166.528 35.9484 169.799 36.2303 172.268C36.4913 174.554 36.9183 175.404 37.2942 175.925C37.6702 176.447 38.3413 177.121 40.4272 178.091C42.6807 179.14 45.7804 180.184 50.6814 181.818L61.8437 185.539C70.3379 188.37 75.3774 189.981 79.0625 190.657Z"
        fill="#0F0F0F"
        fillOpacity="0.05"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconImageBlank(props: IconProps) {
  return (
    <Icon {...props} fill="none" stroke={props.stroke || "currentColor"}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M68.1818 26.1365C65.0438 26.1365 62.5 28.6803 62.5 31.8183C62.5 34.9563 65.0438 37.5001 68.1818 37.5001C71.3198 37.5001 73.8636 34.9563 73.8636 31.8183C73.8636 28.6803 71.3198 26.1365 68.1818 26.1365ZM55.6818 31.8183C55.6818 24.9147 61.2782 19.3183 68.1818 19.3183C75.0854 19.3183 80.6818 24.9147 80.6818 31.8183C80.6818 38.7218 75.0854 44.3183 68.1818 44.3183C61.2782 44.3183 55.6818 38.7218 55.6818 31.8183Z"
        fill="#0F0F0F"
        fillOpacity="0.05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.7392 1.13648H50.2608C60.7535 1.13642 68.9764 1.13637 75.3922 1.99896C81.9592 2.88187 87.1411 4.72432 91.2084 8.79164C95.2758 12.859 97.1182 18.0409 98.0011 24.6079C98.8637 31.0237 98.8637 39.2466 98.8636 49.7393V50.2609C98.8637 60.7536 98.8637 68.9765 98.0011 75.3923C97.1182 81.9593 95.2758 87.1413 91.2084 91.2086C87.1411 95.2759 81.9592 97.1183 75.3922 98.0012C68.9764 98.8638 60.7535 98.8638 50.2608 98.8637H49.7392C39.2465 98.8638 31.0236 98.8638 24.6077 98.0012C18.0408 97.1183 12.8588 95.2759 8.79152 91.2086C4.7242 87.1413 2.88174 81.9593 1.99884 75.3923C1.13625 68.9765 1.13629 60.7536 1.13635 50.2609V49.7393C1.13629 39.2466 1.13625 31.0237 1.99884 24.6079C2.88174 18.0409 4.7242 12.859 8.79152 8.79164C12.8588 4.72432 18.0408 2.88187 24.6077 1.99896C31.0236 1.13637 39.2465 1.13642 49.7392 1.13648ZM13.6127 86.3874C11.0234 83.798 9.53748 80.2948 8.75622 74.4838C8.05859 69.295 7.96799 62.6752 7.95627 53.8189L14.7521 47.8726C17.5435 45.4301 21.7506 45.5702 24.3734 48.193L43.8722 67.6917C48.1674 71.9869 54.9286 72.5725 59.8984 69.0799L61.2538 68.1273C65.1546 65.3858 70.4322 65.7035 73.9761 68.893L88.6285 82.0801C88.788 82.2236 88.9572 82.3493 89.1339 82.4573C88.3992 84.0069 87.494 85.2806 86.3873 86.3874C83.7979 88.9767 80.2946 90.4626 74.4837 91.2439C68.5747 92.0383 60.8101 92.0455 50 92.0455C39.1899 92.0455 31.4252 92.0383 25.5162 91.2439C19.7053 90.4626 16.202 88.9767 13.6127 86.3874ZM25.5162 8.75634C19.7053 9.5376 16.202 11.0235 13.6127 13.6128C11.0234 16.2022 9.53748 19.7054 8.75622 25.5164C8.09652 30.4232 7.97964 36.6095 7.95897 44.7568L10.2623 42.7414C15.7551 37.9352 24.0337 38.2108 29.1946 43.3718L48.6933 62.8705C50.6457 64.8229 53.719 65.0891 55.978 63.5015L57.3334 62.5489C63.8348 57.9799 72.6308 58.5092 78.5372 63.825L91.1461 75.1731C91.1798 74.947 91.2124 74.7173 91.2437 74.4838C92.0382 68.5748 92.0454 60.8102 92.0454 50.0001C92.0454 39.19 92.0382 31.4254 91.2437 25.5164C90.4625 19.7054 88.9766 16.2022 86.3873 13.6128C83.7979 11.0235 80.2946 9.5376 74.4837 8.75634C68.5747 7.9619 60.8101 7.95466 50 7.95466C39.1899 7.95466 31.4252 7.9619 25.5162 8.75634Z"
        fill="#0F0F0F"
        fillOpacity="0.05"
      />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconVideoBlank(props: IconProps) {
  return (
    <Icon {...props} fill="none" stroke={props.stroke || "currentColor"}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M101.519 68.8267C89.3402 61.6363 75.6249 71.4144 75.6249 84.454V135.546C75.6249 148.586 89.3403 158.364 101.519 151.173L144.787 125.627C156.46 118.736 156.46 101.264 144.787 94.3727L101.519 68.8267ZM89.3749 84.454C89.3749 82.6346 90.2562 81.362 91.295 80.7124C92.3003 80.0838 93.4252 80.0158 94.5282 80.667L137.797 106.213C139.013 106.931 139.791 108.302 139.791 110C139.791 111.698 139.013 113.069 137.797 113.787L94.5282 139.333C93.4252 139.984 92.3003 139.916 91.295 139.288C90.2562 138.638 89.3749 137.365 89.3749 135.546V84.454Z"
        fill="#0F0F0F"
        fillOpacity="0.05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M110 11.4585C55.5769 11.4585 11.4583 55.577 11.4583 110C11.4583 164.423 55.5769 208.542 110 208.542C164.423 208.542 208.541 164.423 208.541 110C208.541 55.577 164.423 11.4585 110 11.4585ZM25.2083 110C25.2083 63.171 63.1708 25.2085 110 25.2085C156.829 25.2085 194.791 63.171 194.791 110C194.791 156.829 156.829 194.792 110 194.792C63.1708 194.792 25.2083 156.829 25.2083 110Z"
        fill="#0F0F0F"
        fillOpacity="0.05"
      />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconArrowInput(props: IconProps) {
  return (
    <Icon {...props} fill="transparent" stroke={props.stroke || "currentColor"}>
      <path
        d="M2.5 8H13.5"
        stroke="#0F0F0F"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3.5L13.5 8L9 12.5"
        stroke="#0F0F0F"
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconFilledStar(props: IconProps) {
  return (
    <Icon
      {...props}
      viewBox="0 0 24 24"
      stroke={props.stroke || "currentColor"}
      stroke-width="2"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
        strokeWidth="0"
        fill="currentColor"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */ // Lucide icons
export function IconStar(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconStarHalf(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2" />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconBadgeCheck(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconX(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/Icons` instead
 */
export function IconSliders(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 16 16" fill="none">
      <path
        d="M4.00002 6.5625V2.5C4.00002 2.36739 3.94734 2.24021 3.85357 2.14645C3.7598 2.05268 3.63262 2 3.50002 2C3.36741 2 3.24023 2.05268 3.14646 2.14645C3.05269 2.24021 3.00002 2.36739 3.00002 2.5V6.5625C2.56981 6.67265 2.1885 6.92285 1.9162 7.27365C1.64389 7.62446 1.49609 8.05591 1.49609 8.5C1.49609 8.94409 1.64389 9.37554 1.9162 9.72635C2.1885 10.0771 2.56981 10.3273 3.00002 10.4375V13.5C3.00002 13.6326 3.05269 13.7598 3.14646 13.8536C3.24023 13.9473 3.36741 14 3.50002 14C3.63262 14 3.7598 13.9473 3.85357 13.8536C3.94734 13.7598 4.00002 13.6326 4.00002 13.5V10.4375C4.43022 10.3273 4.81153 10.0771 5.08384 9.72635C5.35614 9.37554 5.50394 8.94409 5.50394 8.5C5.50394 8.05591 5.35614 7.62446 5.08384 7.27365C4.81153 6.92285 4.43022 6.67265 4.00002 6.5625ZM3.50002 9.5C3.30223 9.5 3.10889 9.44135 2.94445 9.33147C2.78 9.22159 2.65182 9.06541 2.57614 8.88268C2.50045 8.69996 2.48064 8.49889 2.51923 8.30491C2.55782 8.11093 2.65306 7.93275 2.79291 7.79289C2.93276 7.65304 3.11094 7.5578 3.30493 7.51921C3.49891 7.48063 3.69997 7.50043 3.8827 7.57612C4.06543 7.65181 4.2216 7.77998 4.33148 7.94443C4.44137 8.10888 4.50002 8.30222 4.50002 8.5C4.50002 8.76522 4.39466 9.01957 4.20712 9.20711C4.01959 9.39464 3.76523 9.5 3.50002 9.5ZM8.50002 3.5625V2.5C8.50002 2.36739 8.44734 2.24021 8.35357 2.14645C8.2598 2.05268 8.13262 2 8.00002 2C7.86741 2 7.74023 2.05268 7.64646 2.14645C7.55269 2.24021 7.50002 2.36739 7.50002 2.5V3.5625C7.06981 3.67265 6.6885 3.92285 6.4162 4.27365C6.14389 4.62446 5.99609 5.05591 5.99609 5.5C5.99609 5.94409 6.14389 6.37554 6.4162 6.72635C6.6885 7.07715 7.06981 7.32735 7.50002 7.4375V13.5C7.50002 13.6326 7.55269 13.7598 7.64646 13.8536C7.74023 13.9473 7.86741 14 8.00002 14C8.13262 14 8.2598 13.9473 8.35357 13.8536C8.44734 13.7598 8.50002 13.6326 8.50002 13.5V7.4375C8.93022 7.32735 9.31153 7.07715 9.58383 6.72635C9.85614 6.37554 10.0039 5.94409 10.0039 5.5C10.0039 5.05591 9.85614 4.62446 9.58383 4.27365C9.31153 3.92285 8.93022 3.67265 8.50002 3.5625ZM8.00002 6.5C7.80223 6.5 7.60889 6.44135 7.44445 6.33147C7.28 6.22159 7.15182 6.06541 7.07614 5.88268C7.00045 5.69996 6.98064 5.49889 7.01923 5.30491C7.05782 5.11093 7.15306 4.93275 7.29291 4.79289C7.43276 4.65304 7.61094 4.5578 7.80492 4.51921C7.99891 4.48063 8.19997 4.50043 8.3827 4.57612C8.56543 4.65181 8.7216 4.77998 8.83148 4.94443C8.94137 5.10888 9.00002 5.30222 9.00002 5.5C9.00002 5.76522 8.89466 6.01957 8.70712 6.20711C8.51959 6.39464 8.26523 6.5 8.00002 6.5ZM14.5 10.5C14.4996 10.0566 14.3521 9.62586 14.0807 9.27525C13.8092 8.92464 13.4292 8.67397 13 8.5625V2.5C13 2.36739 12.9473 2.24021 12.8536 2.14645C12.7598 2.05268 12.6326 2 12.5 2C12.3674 2 12.2402 2.05268 12.1465 2.14645C12.0527 2.24021 12 2.36739 12 2.5V8.5625C11.5698 8.67265 11.1885 8.92285 10.9162 9.27365C10.6439 9.62446 10.4961 10.0559 10.4961 10.5C10.4961 10.9441 10.6439 11.3755 10.9162 11.7263C11.1885 12.0771 11.5698 12.3273 12 12.4375V13.5C12 13.6326 12.0527 13.7598 12.1465 13.8536C12.2402 13.9473 12.3674 14 12.5 14C12.6326 14 12.7598 13.9473 12.8536 13.8536C12.9473 13.7598 13 13.6326 13 13.5V12.4375C13.4292 12.326 13.8092 12.0754 14.0807 11.7247C14.3521 11.3741 14.4996 10.9434 14.5 10.5ZM12.5 11.5C12.3022 11.5 12.1089 11.4414 11.9444 11.3315C11.78 11.2216 11.6518 11.0654 11.5761 10.8827C11.5004 10.7 11.4806 10.4989 11.5192 10.3049C11.5578 10.1109 11.6531 9.93275 11.7929 9.79289C11.9328 9.65304 12.1109 9.5578 12.3049 9.51921C12.4989 9.48063 12.7 9.50043 12.8827 9.57612C13.0654 9.65181 13.2216 9.77998 13.3315 9.94443C13.4414 10.1089 13.5 10.3022 13.5 10.5C13.5 10.7652 13.3947 11.0196 13.2071 11.2071C13.0196 11.3946 12.7652 11.5 12.5 11.5Z"
        fill="#343330"
      />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconFourGrid(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 46 46" fill="none">
      <rect x="12" y="12" width="4" height="4" fill="currentColor" />
      <rect x="18" y="12" width="4" height="4" fill="currentColor" />
      <rect x="24" y="12" width="4" height="4" fill="currentColor" />
      <rect x="30" y="12" width="4" height="4" fill="currentColor" />
      <rect x="12" y="18" width="4" height="4" fill="currentColor" />
      <rect x="18" y="18" width="4" height="4" fill="currentColor" />
      <rect x="24" y="18" width="4" height="4" fill="currentColor" />
      <rect x="30" y="18" width="4" height="4" fill="currentColor" />
      <rect x="12" y="24" width="4" height="4" fill="currentColor" />
      <rect x="18" y="24" width="4" height="4" fill="currentColor" />
      <rect x="24" y="24" width="4" height="4" fill="currentColor" />
      <rect x="30" y="24" width="4" height="4" fill="currentColor" />
      <rect x="12" y="30" width="4" height="4" fill="currentColor" />
      <rect x="18" y="30" width="4" height="4" fill="currentColor" />
      <rect x="24" y="30" width="4" height="4" fill="currentColor" />
      <rect x="30" y="30" width="4" height="4" fill="currentColor" />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconThreeGrid(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 46 46" fill="none">
      <rect x="12" y="12" width="6" height="6" fill="currentColor" />
      <rect x="20" y="12" width="6" height="6" fill="currentColor" />
      <rect x="28" y="12" width="6" height="6" fill="currentColor" />
      <rect x="12" y="20" width="6" height="6" fill="currentColor" />
      <rect x="20" y="20" width="6" height="6" fill="currentColor" />
      <rect x="28" y="20" width="6" height="6" fill="currentColor" />
      <rect x="12" y="28" width="6" height="6" fill="currentColor" />
      <rect x="20" y="28" width="6" height="6" fill="currentColor" />
      <rect x="28" y="28" width="6" height="6" fill="currentColor" />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconTwoGrid(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 46 46" fill="none">
      <rect x="12" y="12" width="10" height="10" fill="currentColor" />
      <rect x="24" y="12" width="10" height="10" fill="currentColor" />
      <rect x="12" y="24" width="10" height="10" fill="currentColor" />
      <rect x="24" y="24" width="10" height="10" fill="currentColor" />
    </Icon>
  );

  /**
   * @deprecated Use icon from `@/components/Icons` instead
   */
}
export function IconOneGrid(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 46 46" fill="none">
      <rect x="12" y="12" width="22" height="22" fill="currentColor" />
    </Icon>
  );
}
