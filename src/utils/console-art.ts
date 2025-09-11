import figlet from "figlet";

export default async (message: string) => {
  await figlet.text(message);
}