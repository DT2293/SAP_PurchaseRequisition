const cds = require('@sap/cds');
const { STATUS } = require('../constants');
const {
  toNumber,
  getPRIdFromItemContext,
  ensurePREditable,
  recalcTotalAmount,
  defaultItemUnitPriceFromProduct
} = require('../helpers');

module.exports = (srv) => {
  const { PurchaseRequisitions, PurchaseRequisitionItems, Products } = srv.entities;
  const { SELECT } = cds.ql;

  // =========================
  // CREATE item: validate & compute from req.data (full payload)
  // =========================
  srv.before('CREATE', 'PurchaseRequisitionItems', async (req) => {
    const tx = cds.tx(req);

    const prId = await getPRIdFromItemContext(req, tx, PurchaseRequisitionItems);
    if (!prId) return req.reject(400, 'Missing prId for item');

    await ensurePREditable(req, tx, PurchaseRequisitions, prId, STATUS);

    await defaultItemUnitPriceFromProduct(tx, Products, req.data);

    const q = toNumber(req.data.quantity);
    const p = toNumber(req.data.unitPrice);

    if (q === null || Number.isNaN(q)) return req.reject(400, 'quantity must be a number');
    if (p === null || Number.isNaN(p)) return req.reject(400, 'unitPrice must be a number');
    if (q <= 0) return req.reject(400, 'quantity must be > 0');
    if (p < 0) return req.reject(400, 'unitPrice must be >= 0');

    req.data.lineAmount = q * p;
  });

  // =========================
  // UPDATE item (PATCH): read current -> merge -> validate -> compute
  // =========================
  srv.before('UPDATE', 'PurchaseRequisitionItems', async (req) => {
    const tx = cds.tx(req);

    // key from URL: PurchaseRequisitionItems(prItemId='...')
    const prItemId = req.data?.prItemId || req.params?.[0]?.prItemId;
    if (!prItemId) return req.reject(400, 'Missing prItemId');

    const current = await tx.run(
      SELECT.one.from(PurchaseRequisitionItems).where({ prItemId })
    );
    if (!current) return req.reject(404, `Item not found: ${prItemId}`);

    const prId = current.prId;
    if (!prId) return req.reject(400, 'Missing prId for item (from DB)');

    await ensurePREditable(req, tx, PurchaseRequisitions, prId, STATUS);

    await defaultItemUnitPriceFromProduct(tx, Products, req.data);

    const merged = { ...current, ...req.data };

    const q = toNumber(merged.quantity);
    const p = toNumber(merged.unitPrice);

    if (q === null || Number.isNaN(q)) return req.reject(400, 'quantity must be a number');
    if (p === null || Number.isNaN(p)) return req.reject(400, 'unitPrice must be a number');
    if (q <= 0) return req.reject(400, 'quantity must be > 0');
    if (p < 0) return req.reject(400, 'unitPrice must be >= 0');

    req.data.lineAmount = q * p;

    if (!req.data.prId) req.data.prId = prId;
  });

  // =========================
  // DELETE item: block if PR not SUBMITTED
  // =========================
  srv.before('DELETE', 'PurchaseRequisitionItems', async (req) => {
    const tx = cds.tx(req);

    const prId = await getPRIdFromItemContext(req, tx, PurchaseRequisitionItems);
    if (!prId) return req.reject(400, 'Missing prId for item delete');

    await ensurePREditable(req, tx, PurchaseRequisitions, prId, STATUS);
  });

  // =========================
  // After item change -> recalc totalAmount
  // =========================
  srv.after(['CREATE', 'UPDATE', 'DELETE'], 'PurchaseRequisitionItems', async (_, req) => {
    const tx = cds.tx(req);

    const prId = await getPRIdFromItemContext(req, tx, PurchaseRequisitionItems);
    if (!prId) return;

    await recalcTotalAmount(tx, PurchaseRequisitions, PurchaseRequisitionItems, prId);
  });
};
