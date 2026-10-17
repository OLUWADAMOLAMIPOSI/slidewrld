import crypto from "crypto";

function baseUrl() {
  return (process.env.OPAY_BASE_URL || "https://sandboxapi.opaycheckout.com").replace(/\/$/, "");
}

export function isOpayConfigured() {
  return Boolean(
    process.env.OPAY_MERCHANT_ID && process.env.OPAY_PUBLIC_KEY && process.env.OPAY_SECRET_KEY
  );
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortKeys(value[key]);
        return result;
      }, {});
  }
  return value;
}

function sortedJson(body) {
  return JSON.stringify(sortKeys(body));
}

function signBody(body) {
  return crypto
    .createHmac("sha512", process.env.OPAY_SECRET_KEY)
    .update(sortedJson(body))
    .digest("hex");
}

async function opayRequest(path, bearer, body) {
  const response = await fetch(baseUrl() + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      MerchantId: process.env.OPAY_MERCHANT_ID,
      "Content-Type": "application/json",
    },
    body: sortedJson(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!data) {
    throw new Error(`OPay returned an unreadable response (HTTP ${response.status}).`);
  }
  if (data.code !== "00000" && data.code !== "00") {
    throw new Error(`OPay error ${data.code}: ${data.message}`);
  }
  return data;
}

export async function createCashierPayment({
  reference,
  totalNaira,
  customer,
  items,
  returnUrl,
  cancelUrl,
  callbackUrl,
}) {
  const productList = items.map((item, index) => ({
    productId: `${item.productId}-${index + 1}`,
    name: item.name,
    description:
      [item.color ? `Color: ${item.color}` : null, item.size ? `Size: ${item.size}` : null]
        .filter(Boolean)
        .join(", ") || item.name,
    price: Math.round(item.price * 100),
    quantity: item.quantity,
  }));

  const body = {
    country: "NG",
    reference,
    amount: { total: Math.round(totalNaira * 100), currency: "NGN" },
    returnUrl,
    cancelUrl,
    callbackUrl,
    expireAt: 30,
    userInfo: { userEmail: customer.email, userName: customer.name },
    productList,
  };

  const data = await opayRequest(
    "/api/v1/international/cashier/create",
    process.env.OPAY_PUBLIC_KEY,
    body
  );
  return data.data;
}

export async function queryPaymentStatus(reference) {
  const body = { reference, country: "NG" };
  return opayRequest("/api/v1/international/cashier/status", signBody(body), body);
}