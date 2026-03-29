import { readFileSync, writeFileSync } from "fs";

export type UserData = {
  [savedProductsListId: string]: {
    name: string,
    products: string[],
  },
};

export type StorageData = {
  [userId: string]: UserData,
};

export const getData = (): StorageData => {
  return JSON.parse(readFileSync("./data/main.json").toString());
};

export const setData = (data: StorageData): void => {
  writeFileSync("./data/main.json", JSON.stringify(data, null, 2));
};

export const initUserSavedProducts = (userId: string): void => {
  const data = getData();

  data[userId] = {
    main: {
      name: "Main",
      products: [],
    },
  };

  setData(data);
};

export const getUserSavedProducts = (userId: string): UserData | undefined => {
  const data = getData();
  return data[userId];
};

export const addProductToUserSavedProducts = (userId: string, productId: string): void => {
  const data = getData();
  data[userId].main.products.push(productId);
  setData(data);
};

export const removeProductFromUserSavedProducts = (userId: string, productId: string): void => {
  const data = getData();
  data[userId].main.products = data[userId].main.products.filter(item => item !== productId);
  setData(data);
};

export const toggleProductInUserSavedProducts = (userId: string, productId: string): void => {
  const savedProducts = getUserSavedProducts(userId);

  if (savedProducts?.main.products.includes(productId)) {
    removeProductFromUserSavedProducts(userId, productId);
  } else {
    addProductToUserSavedProducts(userId, productId);
  }
};
