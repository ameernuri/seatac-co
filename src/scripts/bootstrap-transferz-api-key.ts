import { createTransferzApiKeyFromCredentials } from "@/lib/travel/transferz";

async function main() {
  const result = await createTransferzApiKeyFromCredentials();

  process.stdout.write(`TRANSFERZ_API_KEY=${result.apiKey}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown Transferz bootstrap error.";
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
