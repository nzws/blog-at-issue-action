import { statSync } from 'fs';

const isExist = (filePath: string): boolean => {
  try {
    statSync(filePath);
    return true;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }

    return false;
  }
};

export default isExist;
