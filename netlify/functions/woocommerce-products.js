const buildUrl = (baseUrl, perPage) => {
  const url = new URL("/wp-json/wc/v3/products", baseUrl);
  url.searchParams.set("per_page", perPage || "8");
  return url;
};

exports.handler = async (event) => {
  try {
    const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing WooCommerce environment variables.",
        }),
      };
    }

    const perPage = event.queryStringParameters?.per_page || "8";
    const url = buildUrl(storeUrl, perPage);
    url.searchParams.set("consumer_key", consumerKey);
    url.searchParams.set("consumer_secret", consumerSecret);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch WooCommerce products.",
      }),
    };
  }
};
