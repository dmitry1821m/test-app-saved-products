import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  createUserSavedProductsList,
  getUserSavedProducts,
  toggleProductInUserSavedProducts,
} from "../storage.server";

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.public.appProxy(request);
  
  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const productId = url.searchParams.get("product_id");

  if (!customerId) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  if (!productId) {
    return Response.json({ error: "Missing required param: product_id" }, { status: 400 });
  }

  const userSavedProducts = getUserSavedProducts(customerId);

  if (!userSavedProducts) {
    createUserSavedProductsList(customerId);
  }

  toggleProductInUserSavedProducts(customerId, productId);
  const isSaved = getUserSavedProducts(customerId)?.includes(productId) ?? false;

  return Response.json({ isSaved });
}
