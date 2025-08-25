// File with helper functions in regards to local storage

export async function getStorage(keys) {
  return await chrome.storage.local.get(keys);
}

export async function setStorage(data) {
  return await chrome.storage.local.set(data);
}

export async function removeStorage(keys) {
  return await chrome.storage.local.remove(keys);
} 
