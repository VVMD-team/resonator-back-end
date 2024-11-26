export default function generateMockTransactionHash(): string {
  const characters = "abcdef0123456789";
  let hash = "0x";

  for (let i = 0; i < 64; i++) {
    hash += characters[Math.floor(Math.random() * characters.length)];
  }

  return hash;
}
