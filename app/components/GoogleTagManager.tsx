import {useLoaderData} from '@remix-run/react';
import {Script} from '@shopify/hydrogen';
import {loader} from '~/root';

export function GoogleGTM() {
  const data = useLoaderData<typeof loader>();
  let id = data.googleGtmID;
  if (!id) {
    return null;
  }

  return (
    <>
      {/* Initialize GTM container */}
      <Script
        dangerouslySetInnerHTML={{
          __html: `
              dataLayer = window.dataLayer || [];

              function gtag(){
                dataLayer.push(arguments)
              };

              gtag('js', new Date());
              gtag({'gtm.start': new Date().getTime(),event:'gtm.js'})
              gtag('config', "${id}");
          `,
        }}
      />

      {/* Load GTM script */}
      <Script async src={`https://www.googletagmanager.com/gtm.js?id=${id}`} />
    </>
  );
}
