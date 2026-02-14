
const cds = require('@sap/cds');
const { SELECT, UPDATE } = cds.ql;

function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

async function getPR(tx, PurchaseRequisitions, prId) {
  return tx.run(SELECT.one.from(PurchaseRequisitions).where({ prId }));
}

async function getItem(tx, PurchaseRequisitionItems, prItemId) {
  return tx.run(SELECT.one.from(PurchaseRequisitionItems).where({ prItemId }));
}

async function getPRIdFromItemContext(req, tx, PurchaseRequisitionItems) {
  if (req.data?.prId) return req.data.prId;

  const prItemId = req.data?.prItemId || req.params?.[0]?.prItemId;
  if (!prItemId) return null;

  const item = await getItem(tx, PurchaseRequisitionItems, prItemId);
  return item?.prId;
}

async function ensurePREditable(req, tx, PurchaseRequisitions, prId, STATUS) {
  const pr = await getPR(tx, PurchaseRequisitions, prId);
  if (!pr) req.error(404, `PR not found: ${prId}`);
  if (pr.status !== STATUS.SUBMITTED) {
    req.error(400, `PR is read-only. Current status = ${pr.status}`);
  }
  return pr;
}

async function recalcTotalAmount(tx, PurchaseRequisitions, PurchaseRequisitionItems, prId) {
  const rows = await tx.run(
    SELECT.from(PurchaseRequisitionItems)
      .columns`sum(lineAmount) as total`
      .where({ prId })
  );

  const total = rows?.[0]?.total ?? 0;

  await tx.run(
    UPDATE(PurchaseRequisitions)
      .set({ totalAmount: total })
      .where({ prId })
  );
}

async function ensureHeaderCurrencyFromVendor(tx, Vendors, data) {
  if (!data.vendorId) return;
  const vendor = await tx.run(SELECT.one.from(Vendors).where({ vendorId: data.vendorId }));
  if (!vendor) return;
  if (!data.currencyCode) data.currencyCode = vendor.currencyCode;
}

async function defaultItemUnitPriceFromProduct(tx, Products, data) {
  if (!data.productId) return;
  if (data.unitPrice !== undefined && data.unitPrice !== null && data.unitPrice !== '') return;
  const p = await tx.run(SELECT.one.from(Products).where({ productId: data.productId }));
  if (p) data.unitPrice = p.basePrice;
}

module.exports = {
  toNumber,
  getPR,
  getItem,
  getPRIdFromItemContext,
  ensurePREditable,
  recalcTotalAmount,
  ensureHeaderCurrencyFromVendor,
  defaultItemUnitPriceFromProduct
};

