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
  const formData = await request.formData();
  const email = formData.get("email");
  let errorMessage = "";

  if (!apiToken) {
    errorMessage = "Missing KLAVIYO_PRIVATE_API_TOKEN";
  }
  if (!email) {
    errorMessage = "Email is required";
  }
  if (errorMessage) {
    return data(
      {
        success: false,
        message: errorMessage,
      },
      400,
    );
  }

  try {
    const response = await fetch(KLAVIYO_API, {
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
    const status = response.status;
    const message = await response.json();
    if (response.ok) {
      return data({ success: true }, status);
    }
    return data({ success: false, message }, status);
  } catch (e) {
    return data(
      { success: false, message: "Something went wrong! Please try again." },
      500,
    );
  }
};
