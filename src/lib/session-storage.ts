
export function setItem<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting item ${key} in sessionStorage:`, error);
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return null;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error(`Error getting item ${key} from sessionStorage:`, error);
    return null;
  }
}

export function removeItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from sessionStorage:`, error);
  }
}
