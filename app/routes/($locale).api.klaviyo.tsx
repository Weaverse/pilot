import {
  ActionFunction,
  ActionFunctionArgs,
  json,
} from "@remix-run/server-runtime";

export let action: ActionFunction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  let apiToken = context.env.KLAVIYO_PRIVATE_API_TOKEN;
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
    return json(
      {
        success: false,
        message: errorMessage,
      },
      400
    );
  }

  const body = {
    data: {
      type: "profile",
      attributes: {
        email,
      },
    },
  };
  const options = {
    method: "POST",
    headers: {
      accept: "application/vnd.api+json",
      revision: "2024-10-15",
      "content-type": "application/vnd.api+json",
      Authorization: `Klaviyo-API-Key ${apiToken}`,
    },
    body: JSON.stringify(body),
  };
  try {
    const response = await fetch("https://a.klaviyo.com/api/profiles", options);
    const status = response.status;
    const message = await response.json();
    if (response.ok) {
      return json(
        {
          success: true,
        },
        status
      );
    }
    return json(
      {
        success: false,
        message,
      },
      status
    );
  } catch (e) {
    return json(
      {
        success: false,
        message: "Something went wrong! Please try again.",
      },
      500
    );
  }
};
