import { Image } from "~/components/image";

export interface PaymentIcon {
  url: string;
  label: string;
}

const PAYMENT_ICONS: Record<string, PaymentIcon> = {
  "amazon-pay": {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/amazon-pay.svg?v=1775364121",
    label: "Amazon Pay",
  },
  paypal: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/paypal-alt.svg?v=1775364089",
    label: "PayPal",
  },
  klarna: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/klarna.svg?v=1775364059",
    label: "Klarna",
  },
  "google-pay": {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/google-pay.svg?v=1775364032",
    label: "Google Pay",
  },
  "apple-pay": {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/apple-pay.svg?v=1775364019",
    label: "Apple Pay",
  },
  jcb: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/jcb.svg?v=1775363969",
    label: "JCB",
  },
  "american-express": {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/american-express.svg?v=1775363946",
    label: "American Express",
  },
  visa: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/visa.svg?v=1775363926",
    label: "Visa",
  },
  "master-card": {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/mastercard.svg?v=1775363877",
    label: "Mastercard",
  },
  diners: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/diners.svg?v=1775485900",
    label: "Diners Club",
  },
  discover: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/discover.svg?v=1775485929",
    label: "Discover",
  },
  alipay: {
    url: "https://cdn.shopify.com/s/files/1/0838/0052/3057/files/alipay.svg?v=1775485970",
    label: "Alipay",
  },
};

interface PaymentMethodsProps {
  showPaymentMethods: boolean;
  showAmazonPay: boolean;
  showPayPal: boolean;
  showKlarna: boolean;
  showGooglePay: boolean;
  showApplePay: boolean;
  showJCB: boolean;
  showAmericanExpress: boolean;
  showVisa: boolean;
  showMastercard: boolean;
  showDiners: boolean;
  showDiscover: boolean;
  showAlipay: boolean;
}

export function PaymentMethods({
  showPaymentMethods,
  showAmazonPay,
  showPayPal,
  showKlarna,
  showGooglePay,
  showApplePay,
  showJCB,
  showAmericanExpress,
  showVisa,
  showMastercard,
  showDiners,
  showDiscover,
  showAlipay,
}: PaymentMethodsProps) {
  if (!showPaymentMethods) {
    return <div />;
  }

  let payments: PaymentIcon[] = [];
  if (showAmazonPay) {
    payments.push(PAYMENT_ICONS["amazon-pay"]);
  }
  if (showPayPal) {
    payments.push(PAYMENT_ICONS.paypal);
  }
  if (showKlarna) {
    payments.push(PAYMENT_ICONS.klarna);
  }
  if (showGooglePay) {
    payments.push(PAYMENT_ICONS["google-pay"]);
  }
  if (showApplePay) {
    payments.push(PAYMENT_ICONS["apple-pay"]);
  }
  if (showJCB) {
    payments.push(PAYMENT_ICONS.jcb);
  }
  if (showAmericanExpress) {
    payments.push(PAYMENT_ICONS["american-express"]);
  }
  if (showVisa) {
    payments.push(PAYMENT_ICONS.visa);
  }
  if (showMastercard) {
    payments.push(PAYMENT_ICONS["master-card"]);
  }
  if (showDiners) {
    payments.push(PAYMENT_ICONS.diners);
  }
  if (showDiscover) {
    payments.push(PAYMENT_ICONS.discover);
  }
  if (showAlipay) {
    payments.push(PAYMENT_ICONS.alipay);
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {payments.map(({ url, label: altText }) => (
        <Image
          key={url}
          data={{ url, altText, width: 40, height: 24 }}
          className="h-6 w-10 rounded-none"
          loading="lazy"
          width={100}
          height={50}
          sizes="auto"
          style={{ borderRadius: "2px" }}
        />
      ))}
    </div>
  );
}
