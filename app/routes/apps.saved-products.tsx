import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getUserSavedProducts } from "../storage.server";

type ProductNodeImage = {
  url: string,
  altText: string | null,
};

type ProductNode = {
  id: string,
  title: string,
  handle: string,
  featuredImage: ProductNodeImage | null,
};

type Product = {
  id: string,
  title: string,
  url: string,
  image: string | null,
  imageAlt: string,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");

  if (!customerId) {
    return Response.json({ error: "Not logged in" }, { status: 500 });
  }

  if (!admin) {
    return Response.json({ error: "Can't get data" }, { status: 500 });
  }

  const userSavedProducts = getUserSavedProducts(customerId);

  if (!userSavedProducts) {
    return Response.json(null);
  }

  const gids = userSavedProducts.main.products.map((id) => `gid://shopify/Product/${id}`);

  const shopifyProductsResponse = await admin.graphql(
    `#graphql
    query GetSavedProducts($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
        }
      }
    }`,
    { variables: { ids: gids } },
  );

  const { data } = await shopifyProductsResponse.json();
  const nodes: ProductNode[] = data?.nodes ?? [];
  const products: Product[] = [];

  nodes.forEach((node: ProductNode | null) => {
    if (!node) {
      return null;
    }

    const numericId = node.id.replace("gid://shopify/Product/", "");
    
    const product: Product = {
      id: numericId,
      title: node.title,
      url: `/products/${node.handle}`,
      image: node.featuredImage?.url ?? null,
      imageAlt: node.featuredImage?.altText ?? node.title,
    };

    products.push(product);
  });

  const response = {
    main: {
      ...userSavedProducts.main,
      products: products,
    },
  };

  return Response.json(response);
}
