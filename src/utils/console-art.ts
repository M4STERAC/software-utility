import * as figlet from 'figlet';

export default function generateTextArt(string: string) {
  const art = figlet.textSync(string);
  return art;
};