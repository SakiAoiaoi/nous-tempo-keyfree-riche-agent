export async function askPaidInfoShop(plan) {
  return {
    shop: plan.shop,
    price: plan.amount,
    currency: "USDC",
    message: "This advice costs 0.01 USDC.",
    advice: `Today, Teacher Keyfree should buy ${plan.item}`
  };
}
