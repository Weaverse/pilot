import {
  type ActionFunction,
  type ActionFunctionArgs,
  data,
} from "react-router";

const KLAVIYO_API = "https://a.klaviyo.com/api/profiles";

export const action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const apiToken = context.env.KLAVIYO_PRIVATE_API_TOKEN;
  if (!apiToken) {
    return data({
      ok: false,
      error: "Missing KLAVIYO_PRIVATE_API_TOKEN",
    });
  }

  const formData = await request.formData();
  const email = formData.get("email");
  if (!email) {
    return data({ ok: false, error: "Email is required" });
  }

  try {
    const res = await fetch(KLAVIYO_API, {
      method: "POST",
      headers: {
        accept: "application/vnd.api+json",
        revision: "2024-10-15",
        "content-type": "application/vnd.api+json",
        Authorization: `Klaviyo-API-Key ${apiToken}`,
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: { email },
        },
      }),
    });

    const status = res.status;
    const klaviyoData = await res.json();
    if (res.ok) {
      return data({ ok: true }, status);
    }
    return data(
      { ok: false, error: "Unable to subscribe", klaviyoData },
      status,
    );
  } catch (e) {
    return data(
      { ok: false, error: "Something went wrong! Please try again." },
      500,
    );
  }
};
