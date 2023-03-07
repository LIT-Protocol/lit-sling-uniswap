import { atom } from "recoil";

export const loadingState = atom({
  key: "loadingState",
  default: true,
});

export const providerState = atom({
  key: "providerState",
  default: null,
});

export const userPkpsState = atom({
  key: 'userPkpsState',
  default: null,
});

export const selectedPkpState = atom({
  key: 'selectedPkpState',
  default: null,
});

export const pkpWalletState = atom({
  key: 'pkpWalletState',
  default: null,
});

export const errorObjectState = atom({
  key: 'errorObjectState',
  default: null,
});

export const authSigState = atom({
  key: 'authSigState',
  default: null,
});