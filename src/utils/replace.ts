const replace = (text: string, key: string, value: string): string =>
  text.replace(new RegExp(`{${key}}`, 'g'), value);

const replaceStr = (
  text: string,
  data: {
    [key: string]: string;
  }
): string =>
  Object.keys(data).reduce(
    (acc, value) => replace(acc, value, data[value]),
    text
  );

export default replaceStr;
