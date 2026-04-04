import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  initUserSavedProducts,
  getUserSavedProducts,
  toggleProductInUserSavedProducts,
} from "../storage.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const productId = url.searchParams.get("product_id");

  if (!customerId) {
    return Response.json({ error: "Not logged in" }, { status: 500 });
  }

  if (!productId) {
    return Response.json({ error: "No product id" }, { status: 500 });
  }

  const userSavedProducts = getUserSavedProducts(customerId);

  if (!userSavedProducts) {
    initUserSavedProducts(customerId);
  }

  toggleProductInUserSavedProducts(customerId, productId);
  const isSaved = getUserSavedProducts(customerId)?.main.products.includes(productId) ?? false;

  return Response.json({ isSaved });
}
