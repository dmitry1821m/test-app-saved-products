import { readFileSync, writeFileSync } from "fs";

export type ProductListData = {
  name: string,
  products: string[],
};

export type UserData = {
  [savedProductsListId: string]: ProductListData,
};

export type StorageData = {
  [userId: string]: UserData,
};

export const getStorageData = (): StorageData => {
  return JSON.parse(readFileSync("./data/main.json").toString());
};

export const setStorageData = (data: StorageData): void => {
  writeFileSync("./data/main.json", JSON.stringify(data, null, 2));
};

export const initUserSavedProducts = (userId: string): void => {
  const data = getStorageData();

  data[userId] = {
    main: {
      name: "Main",
      products: [],
    },
  };

  setStorageData(data);
};

export const getUserSavedProducts = (userId: string): UserData | undefined => {
  const data = getStorageData();
  return data[userId];
};

export const addProductToUserSavedProducts = (userId: string, productId: string): void => {
  const data = getStorageData();
  data[userId].main.products.push(productId);
  setStorageData(data);
};

export const removeProductFromUserSavedProducts = (userId: string, productId: string): void => {
  const data = getStorageData();

  data[userId].main.products = data[userId].main.products.filter((item: string): boolean => {
    return item !== productId;
  });

  setStorageData(data);
};

export const toggleProductInUserSavedProducts = (userId: string, productId: string): void => {
  const savedProducts = getUserSavedProducts(userId);

  if (savedProducts?.main.products.includes(productId)) {
    removeProductFromUserSavedProducts(userId, productId);
  } else {
    addProductToUserSavedProducts(userId, productId);
  }
};
