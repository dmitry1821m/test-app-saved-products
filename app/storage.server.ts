import { readFileSync, writeFileSync } from "fs";

export type UserData = {
  [savedProductsListId: string]: string[],
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

export const createUserSavedProductsList = (userId: string): void => {
  const data = getData();
  data[userId] = { main: [] };
  setData(data);
};

export const getUserSavedProducts = (userId: string): string[] | undefined => {
  const data = getData();
  return data[userId]?.main;
};

export const addProductToUserSavedProducts = (userId: string, productId: string): void => {
  const data = getData();
  data[userId].main.push(productId);
  setData(data);
};

export const removeProductFromUserSavedProducts = (userId: string, productId: string): void => {
  const data = getData();
  data[userId].main = data[userId].main.filter(item => item !== productId);
  setData(data);
};

export const toggleProductInUserSavedProducts = (userId: string, productId: string): void => {
  const savedProducts = getUserSavedProducts(userId);

  if (savedProducts?.includes(productId)) {
    removeProductFromUserSavedProducts(userId, productId);
  } else {
    addProductToUserSavedProducts(userId, productId);
  }
};
