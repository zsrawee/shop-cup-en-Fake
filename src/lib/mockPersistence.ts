import { cookies } from "next/headers";

export async function getMockDataFromCookies(key: string, defaultValue: any) {
  try {
    const cookieStore = await cookies();
    const data = cookieStore.get(`mock_${key}`);
    if (data) {
      return JSON.parse(data.value);
    }
  } catch (e) {
    // cookies() might fail if called outside of request context
  }
  return defaultValue;
}

export async function saveMockDataToCookies(key: string, value: any) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(`mock_${key}`, JSON.stringify(value), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  } catch (e) {
    // cookies() might fail if called outside of request context
  }
}
