const cds = require('@sap/cds');
const { STATUS } = require('../constants');
const { getPR, recalcTotalAmount } = require('../helpers');

module.exports = (srv) => {
  const { PurchaseRequisitions, PurchaseRequisitionItems } = srv.entities;
  const { SELECT, UPDATE } = cds.ql;

  /**
   * Approve PR
   */
  srv.on('approvePR', async (req) => {
    const tx = cds.tx(req);
    const prId = req.data?.prId;
    if (!prId) return req.reject(400, 'Missing prId');

    const pr = await getPR(tx, PurchaseRequisitions, prId);
    if (!pr) return req.reject(404, `Purchase Requisition ${prId} not found`);

    // Business rules
    if (pr.status === STATUS.APPROVED) {
      // Đã approve trước đó → trả về thông báo
      return {
        prId,
        status: STATUS.APPROVED,
        message: `Purchase Requisition ${prId} has already been approved`
      };
    }
    if (pr.status === STATUS.REJECTED) {
      return req.reject(400, `Purchase Requisition ${prId} has been rejected and cannot be approved`);
    }
    if (pr.status !== STATUS.SUBMITTED) {
      return req.reject(400, `Purchase Requisition ${prId} must be SUBMITTED to approve`);
    }

    // Must have at least one item
    const countRows = await tx.run(
      SELECT.from(PurchaseRequisitionItems).columns`count(1) as c`.where({ prId })
    );
    const count = countRows?.[0]?.c ?? 0;
    if (count <= 0) {
      return req.reject(400, `Purchase Requisition ${prId} must contain at least one item`);
    }

    // Recalculate totals before approval
    await recalcTotalAmount(tx, PurchaseRequisitions, PurchaseRequisitionItems, prId);

    await tx.run(
      UPDATE(PurchaseRequisitions)
        .set({ status: STATUS.APPROVED, rejectReason: null })
        .where({ prId })
    );

    return {
      prId,
      status: STATUS.APPROVED,
      message: `Purchase Requisition ${prId} approved successfully`
    };
  });

  /**
   * Reject PR
   */
  srv.on('rejectPR', async (req) => {
    const tx = cds.tx(req);
    const prId = req.data?.prId;
    const rejectReason = req.data?.rejectReason;

    if (!prId) return req.reject(400, 'Missing prId');
    if (!rejectReason || String(rejectReason).trim().length === 0) {
      return req.reject(400, 'Reject reason is required');
    }

    const pr = await getPR(tx, PurchaseRequisitions, prId);
    if (!pr) return req.reject(404, `Purchase Requisition ${prId} not found`);

    // Business rules
    if (pr.status === STATUS.REJECTED) {
      return {
        prId,
        status: STATUS.REJECTED,
        message: `Purchase Requisition ${prId} has already been rejected`
      };
    }
    if (pr.status === STATUS.APPROVED) {
      return req.reject(400, `Purchase Requisition ${prId} has been approved and cannot be rejected`);
    }
    if (pr.status !== STATUS.SUBMITTED) {
      return req.reject(400, `Purchase Requisition ${prId} must be SUBMITTED to reject`);
    }

    await recalcTotalAmount(tx, PurchaseRequisitions, PurchaseRequisitionItems, prId);

    await tx.run(
      UPDATE(PurchaseRequisitions)
        .set({ status: STATUS.REJECTED, rejectReason: String(rejectReason).trim() })
        .where({ prId })
    );

    return {
      prId,
      status: STATUS.REJECTED,
      message: `Purchase Requisition ${prId} rejected. Reason: ${rejectReason}`
    };
  });
};
