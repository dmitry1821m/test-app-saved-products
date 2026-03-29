import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { StorageData, getData } from "../storage.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const data = getData();

  return data;
};

export type ProductsTableProps = {
  data: StorageData,
};

export const ProductsTable = ({ data }: ProductsTableProps) => {
  const productCounts: Record<string, number> = {};

  for (const userData of Object.values(data)) {
    const flatProducts = Object.values(userData).flatMap(list => list.products);
    const uniqueProducts = [...new Set(flatProducts)];

    for (const productId of uniqueProducts) {
      productCounts[productId] = (productCounts[productId] ?? 0) + 1;
    }
  }

  const productCountList = Object.entries(productCounts)
    .map(([productId, count]) => ({ productId, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <s-section heading="Saved Products">
      {productCountList.length > 0 ? (
        <s-table>
          <s-table-header-row>
            <s-table-header>Product ID</s-table-header>
            <s-table-header>Users Added</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {productCountList.map(({ productId, count }) => (
              <s-table-row key={productId}>
                <s-table-cell>{productId}</s-table-cell>
                <s-table-cell>{count}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      ) : (
        <s-paragraph>No saved products yet.</s-paragraph>
      )}
    </s-section>
  );
};

export type UsersTableProps = {
  data: StorageData,
};

export const UsersTable = ({ data }: UsersTableProps) => {
  return (
    <s-section heading="User Lists">
      {Object.keys(data).length > 0 ? (
        <s-table>
          <s-table-header-row>
            <s-table-header>User ID</s-table-header>
            <s-table-header>List</s-table-header>
            <s-table-header>Products</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {Object.entries(data).map(([userId, userSavedProducts]) =>
              Object.entries(userSavedProducts).map(([listId, listData]) => (
                <s-table-row key={`${userId}-${listId}`}>
                  <s-table-cell>{userId}</s-table-cell>
                  <s-table-cell>{listData.name}</s-table-cell>
                  <s-table-cell>
                    {listData.products.length === 0 ? "Empty" : listData.products.join(", ")}
                  </s-table-cell>
                </s-table-row>
              ))
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
  const data = useLoaderData<typeof loader>();

  return (
    <s-page heading="Saved Products">
      <ProductsTable data={data} />
      <UsersTable data={data} />
    </s-page>
  );
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export default Index;
