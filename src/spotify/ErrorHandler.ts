

export const validateAndParse = async (response: Response) => {
  const text = await response.text();
  // Only parse if there is actually content
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    return Promise.reject(data.message);
  }
  return data;
};