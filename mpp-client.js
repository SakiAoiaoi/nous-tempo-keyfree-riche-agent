export async function askPaidInfoShop(plan) {
  if (!plan) {
    throw new Error("Shopping plan がありません");
  }

  if (!plan.shop) {
    throw new Error(
      "Shopping plan に shop がありません"
    );
  }

  if (!plan.item) {
    throw new Error(
      "Shopping plan に item がありません"
    );
  }

  if (!plan.amount) {
    throw new Error(
      "Shopping plan に amount がありません"
    );
  }

  return {
    shop: plan.shop,
    price: plan.amount,
    currency: "USDC",
    message:
      `This advice costs ${plan.amount} USDC.`,
    advice:
      `Today, Teacher Keyfree should buy ${plan.item}`,
    paymentProtocol: "MPP mock"
  };
}
