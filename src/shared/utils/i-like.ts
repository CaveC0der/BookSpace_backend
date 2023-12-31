import { Op } from 'sequelize';

type Mode = 'startsWith' | 'substring' | 'endsWith'

export default function iLike(str: string, mode: Mode = 'substring'): { [Op.iLike]: string } {
  switch (mode) {
    case 'substring': {
      str = '%' + str + '%';
      break;
    }
    case 'startsWith': {
      str = str + '%';
      break;
    }
    case 'endsWith': {
      str = '%' + str;
      break;
    }
  }

  return { [Op.iLike]: str };
}
