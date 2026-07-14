export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every((value) => value && !value.includes("YOUR_"));
}
