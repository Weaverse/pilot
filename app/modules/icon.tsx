import { cn } from "~/lib/cn";

type IconProps = JSX.IntrinsicElements["svg"] & {
  direction?: "up" | "right" | "down" | "left";
};

/**
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
 */
export function IconBag(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Bag</title>
      <path
        fillRule="evenodd"
        d="M8.125 5a1.875 1.875 0 0 1 3.75 0v.375h-3.75V5Zm-1.25.375V5a3.125 3.125 0 1 1 6.25 0v.375h3.5V15A2.625 2.625 0 0 1 14 17.625H6A2.625 2.625 0 0 1 3.375 15V5.375h3.5ZM4.625 15V6.625h10.75V15c0 .76-.616 1.375-1.375 1.375H6c-.76 0-1.375-.616-1.375-1.375Z"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
 */
export function IconLogin(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Login</title>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path
          d="M8,10.6928545 C10.362615,10.6928545 12.4860225,11.7170237 13.9504747,13.3456144 C12.4860225,14.9758308 10.362615,16 8,16 C5.63738499,16 3.51397752,14.9758308 2.04952533,13.3472401 C3.51397752,11.7170237 5.63738499,10.6928545 8,10.6928545 Z"
          fill="currentColor"
        />
        <path
          d="M8,3.5 C6.433,3.5 5.25,4.894 5.25,6.5 C5.25,8.106 6.433,9.5 8,9.5 C9.567,9.5 10.75,8.106 10.75,6.5 C10.75,4.894 9.567,3.5 8,3.5 Z"
          fill="currentColor"
          fillRule="nonzero"
        />
      </g>
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
 */
export function IconAccount(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Account</title>
      <path
        fillRule="evenodd"
        d="M9.9998 12.625c-1.9141 0-3.6628.698-5.0435 1.8611C3.895 13.2935 3.25 11.7221 3.25 10c0-3.728 3.022-6.75 6.75-6.75 3.7279 0 6.75 3.022 6.75 6.75 0 1.7222-.645 3.2937-1.7065 4.4863-1.3807-1.1632-3.1295-1.8613-5.0437-1.8613ZM10 18c-2.3556 0-4.4734-1.0181-5.9374-2.6382C2.7806 13.9431 2 12.0627 2 10c0-4.4183 3.5817-8 8-8s8 3.5817 8 8-3.5817 8-8 8Zm0-12.5c-1.567 0-2.75 1.394-2.75 3s1.183 3 2.75 3 2.75-1.394 2.75-3-1.183-3-2.75-3Z"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
 */
export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <title>Search</title>
      <path
        fillRule="evenodd"
        d="M13.3 8.52a4.77 4.77 0 1 1-9.55 0 4.77 4.77 0 0 1 9.55 0Zm-.98 4.68a6.02 6.02 0 1 1 .88-.88l4.3 4.3-.89.88-4.3-4.3Z"
      />
    </Icon>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
}
/**
 * @deprecated Use icon from `@/components/icons` instead
 */
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
   * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
      fill="none"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
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
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 1a.993 .993 0 0 1 .823 .443l.067 .116l2.852 5.781l6.38 .925c.741 .108 1.08 .94 .703 1.526l-.07 .095l-.078 .086l-4.624 4.499l1.09 6.355a1.001 1.001 0 0 1 -1.249 1.135l-.101 -.035l-.101 -.046l-5.693 -3l-5.706 3c-.105 .055 -.212 .09 -.32 .106l-.106 .01a1.003 1.003 0 0 1 -1.038 -1.06l.013 -.11l1.09 -6.355l-4.623 -4.5a1.001 1.001 0 0 1 .328 -1.647l.113 -.036l.114 -.023l6.379 -.925l2.853 -5.78a.968 .968 0 0 1 .904 -.56zm0 3.274v12.476a1 1 0 0 1 .239 .029l.115 .036l.112 .05l4.363 2.299l-.836 -4.873a1 1 0 0 1 .136 -.696l.07 -.099l.082 -.09l3.546 -3.453l-4.891 -.708a1 1 0 0 1 -.62 -.344l-.073 -.097l-.06 -.106l-2.183 -4.424z"
        strokeWidth="0"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
 * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
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
   * @deprecated Use icon from `@/components/icons` instead
   */
}
export function IconOneGrid(props: IconProps) {
  return (
    <Icon {...props} viewBox="0 0 46 46" fill="none">
      <rect x="12" y="12" width="22" height="22" fill="currentColor" />
    </Icon>
  );
}
