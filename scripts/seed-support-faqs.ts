import "./load-env";
import { seedSupportFaqsFromMarketing } from "@/lib/services/support-faq.service";

async function main() {
  const result = await seedSupportFaqsFromMarketing();
  console.log(`Seeded/updated ${result.upserted} support FAQs`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
