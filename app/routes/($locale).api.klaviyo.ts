import {
  type ActionFunction,
  type ActionFunctionArgs,
  json,
} from "@remix-run/server-runtime";

const KLAVIYO_API = "https://a.klaviyo.com/api/profiles";

export let action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  let apiToken = context.env.KLAVIYO_PRIVATE_API_TOKEN;
  let formData = await request.formData();
  let email = formData.get("email");
  let errorMessage = "";

  if (!apiToken) {
    errorMessage = "Missing KLAVIYO_PRIVATE_API_TOKEN";
  }
  if (!email) {
    errorMessage = "Email is required";
  }
  if (errorMessage) {
    return json(
      {
        success: false,
        message: errorMessage,
      },
      400
    );
  }

  try {
    let response = await fetch(KLAVIYO_API, {
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
    let status = response.status;
    let message = await response.json();
    if (response.ok) {
      return json({ success: true }, status);
    }
    return json({ success: false, message }, status);
  } catch (e) {
    return json(
      { success: false, message: "Something went wrong! Please try again." },
      500
    );
  }
};
