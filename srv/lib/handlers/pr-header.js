
const cds = require('@sap/cds');
const { STATUS } = require('../constants');
const { getPR, ensureHeaderCurrencyFromVendor } = require('../helpers');

module.exports = (srv) => {
  const { PurchaseRequisitions, Vendors } = srv.entities;

  srv.before('CREATE', 'PurchaseRequisitions', async (req) => {
    const tx = cds.tx(req);

    req.data.status = STATUS.SUBMITTED;
    if (req.data.totalAmount == null) req.data.totalAmount = 0;
    if (!req.data.prDate) req.data.prDate = new Date().toISOString().slice(0, 10);

    await ensureHeaderCurrencyFromVendor(tx, Vendors, req.data);

    if (req.data.rejectReason) req.data.rejectReason = null;
  });

  srv.before(['UPDATE', 'DELETE'], 'PurchaseRequisitions', async (req) => {
    const tx = cds.tx(req);
    const prId = req.data?.prId || req.params?.[0]?.prId;
    if (!prId) req.error(400, 'Missing prId');

    const pr = await getPR(tx, PurchaseRequisitions, prId);
    if (!pr) req.error(404, `PR not found: ${prId}`);
    if (pr.status !== STATUS.SUBMITTED) req.error(400, `PR is read-only. Current status = ${pr.status}`);

    if (req.event === 'UPDATE') {
      if ('totalAmount' in req.data) delete req.data.totalAmount;
      if ('rejectReason' in req.data) delete req.data.rejectReason;

      await ensureHeaderCurrencyFromVendor(tx, Vendors, req.data);
    }
  });
};

