import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { ProductListData, StorageData, getStorageData } from "../storage.server";

type ShopifyProduct = {
  id: string;
  title: string;
  url: string;
  image: string | null;
  imageAlt: string;
};

type ProductNodeImage = {
  url: string;
  altText: string | null;
};

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  featuredImage: ProductNodeImage | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const storageData = getStorageData();
  const shopDomain = session.shop;
  const allProductIds = new Set<string>();

  for (const userData of Object.values(storageData)) {
    for (const listData of Object.values(userData)) {
      for (const productId of listData.products) {
        allProductIds.add(productId);
      }
    }
  }

  const productGids = [...allProductIds].map((id: string): string => {
    return `gid://shopify/Product/${id}`;
  });

  const productsResponse = await admin.graphql(
    `#graphql
    query GetProducts($ids: [ID!]!) {
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
    { variables: { ids: productGids } },
  );

  const productNodes: (ProductNode | null)[] = (await productsResponse.json()).data?.nodes;
  const products: Record<string, ShopifyProduct> = {};

  for (const node of productNodes) {
    if (!node) {
      continue;
    }

    const numericId = node.id.replace("gid://shopify/Product/", "");

    products[numericId] = {
      id: numericId,
      title: node.title,
      url: `https://${shopDomain}/products/${node.handle}`,
      image: node.featuredImage?.url ?? null,
      imageAlt: node.featuredImage?.altText ?? node.title,
    };
  }

  return { storageData, products };
};

export type ProductsTableProps = {
  storageData: StorageData;
  products: Record<string, ShopifyProduct>;
};

export const ProductsTable = ({ storageData, products }: ProductsTableProps) => {
  const productCounts: Record<string, number> = {};

  for (const userData of Object.values(storageData)) {
    const flatProducts = Object.values(userData).flatMap((list: ProductListData): string[] => {
      return list.products;
    });

    const uniqueProducts = [...new Set(flatProducts)];

    for (const productId of uniqueProducts) {
      productCounts[productId] = (productCounts[productId] ?? 0) + 1;
    }
  }

  const productCountList = Object.entries(productCounts)
    .map(([productId, count]) => ({ productId, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <s-section heading="Popular Products">
      {productCountList.length > 0 ? (
        <s-table>
          <s-table-header-row>
            <s-table-header>Product</s-table-header>
            <s-table-header>Users added</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {productCountList.map(({ productId, count }) => {
              const product = products[productId];

              if (!product) {
                return;
              }

              return (
                <s-table-row key={productId}>
                  <s-table-cell>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.imageAlt}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      )}
                      {product.title}
                    </a>
                  </s-table-cell>
                  <s-table-cell>{count}</s-table-cell>
                </s-table-row>
              );
            })}
          </s-table-body>
        </s-table>
      ) : (
        <s-paragraph>No saved products yet.</s-paragraph>
      )}
    </s-section>
  );
};

export type UsersTableProps = {
  storageData: StorageData;
  products: Record<string, ShopifyProduct>;
};

export const UsersTable = ({ storageData, products }: UsersTableProps) => {
  return (
    <s-section heading="User Lists">
      {Object.keys(storageData).length > 0 ? (
        <s-table>
          <s-table-header-row>
            <s-table-header>User ID</s-table-header>
            <s-table-header>List name</s-table-header>
            <s-table-header>Products</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {Object.entries(storageData).map(([userId, userSavedProducts]) =>
              Object.entries(userSavedProducts).map(([listId, listData]) => (
                <s-table-row key={`${userId}-${listId}`}>
                  <s-table-cell>{userId}</s-table-cell>
                  <s-table-cell>{listData.name}</s-table-cell>
                  <s-table-cell>
                    {listData.products.length === 0 ? (
                      "Empty"
                    ) : (
                      <span style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {listData.products.map((productId, index) => {
                          const product = products[productId];

                          if (!product) {
                            return;
                          }

                          return (
                            <span key={productId}>
                              <a href={product.url} target="_blank" rel="noreferrer">
                                {product.title}
                              </a>
                              {index < listData.products.length - 1 ? "," : ""}
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </s-table-cell>
                </s-table-row>
              )),
            )}
          </s-table-body>
        </s-table>
      ) : (
        <s-paragraph>No saved products yet.</s-paragraph>
      )}
    </s-section>
  );
};

export const Index = () => {
  const { storageData, products } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Saved Products">
      <ProductsTable storageData={storageData} products={products} />
      <UsersTable storageData={storageData} products={products} />
    </s-page>
  );
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export default Index;
