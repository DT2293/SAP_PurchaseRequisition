sap.ui.define([
  "prfe/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/ui/core/routing/History"
], function (
  BaseController,
  JSONModel,
  MessageToast,
  MessageBox,
  Dialog,
  TextArea,
  Button,
  History
) {
  "use strict";

  /**
   * Controller for Purchase Requisition Detail page.
   * Handles navigation, binding, approve/reject actions, and lifecycle cleanup.
   */
  return BaseController.extend("prfe.controller.PRDetail", {

    /**
     * Initialize view model and attach route pattern matched handler.
     */
    onInit: function () {
      var oVM = new JSONModel({ currencyCode: "" });
      this.getView().setModel(oVM, "view");

      this.getRouter().getRoute("prDetail").attachPatternMatched(this._onMatched, this);
    },

    /**
     * Navigate back to previous page or PR List if no history.
     */
    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("PRList", {}, true);
      }
    },

    /**
     * Handle route matched: bind PR header and filter items table.
     * @param {sap.ui.base.Event} oEvent Route match event
     * @private
     */
    _onMatched: function (oEvent) {
      var sPrId = oEvent.getParameter("arguments").prId;
      this._prId = sPrId;

      var oView = this.getView();
      var oVM = oView.getModel("view");

      // Bind header entity
      var sPath = "/PurchaseRequisitions('" + encodeURIComponent(sPrId) + "')";
      oView.bindElement({
        path: sPath,
        events: {
          change: function () {
            var oCtx = oView.getBindingContext();
            if (!oCtx) return;
            oVM.setProperty("/currencyCode", oCtx.getProperty("currencyCode") || "");
          }
        }
      });

      // Filter items table by prId
      var oTbl = this.byId("tblItems");
      var fnApplyFilter = function () {
        var oBinding = oTbl.getBinding("items");
        if (oBinding) {
          oBinding.filter([new sap.ui.model.Filter("prId", sap.ui.model.FilterOperator.EQ, sPrId)]);
        }
      };
      fnApplyFilter();
      setTimeout(fnApplyFilter, 0);
    },

    /**
     * Approve PR via backend action.
     */
    onApprove: async function () {
      var oView = this.getView();
      var oModel = oView.getModel();

      var oAction = oModel.bindContext("/approvePR(...)");
      oAction.setParameter("prId", this._prId);

      oView.setBusy(true);
      try {
        await oAction.execute();
        MessageToast.show("Approved");
        oModel.refresh();
      } catch (e) {
        MessageBox.error((e && e.message) || "Approve failed");
      } finally {
        oView.setBusy(false);
      }
    },

    /**
     * Open reject dialog for entering reject reason.
     */
    onOpenReject: function () {
      var that = this;

      if (!this._rejectDialog) {
        this._rejectTA = new TextArea({
          width: "100%",
          rows: 3,
          placeholder: "Enter reject reason"
        });

        this._rejectDialog = new Dialog({
          title: "Reject Purchase Requisition",
          contentWidth: "30rem",
          content: [this._rejectTA],
          beginButton: new Button({
            text: "Confirm",
            type: "Emphasized",
            press: function () {
              that._doReject();
            }
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () {
              that._rejectDialog.close();
            }
          })
        });

        this.getView().addDependent(this._rejectDialog);
      }

      this._rejectTA.setValue("");
      this._rejectDialog.open();
    },

    /**
     * Execute reject action with provided reason.
     * @private
     */
    _doReject: async function () {
      var sReason = (this._rejectTA.getValue() || "").trim();
      if (!sReason) {
        MessageBox.warning("Reject reason is required");
        return;
      }

      var oView = this.getView();
      var oModel = oView.getModel();

      var oAction = oModel.bindContext("/rejectPR(...)");
      oAction.setParameter("prId", this._prId);
      oAction.setParameter("rejectReason", sReason);

      oView.setBusy(true);
      try {
        await oAction.execute();
        MessageToast.show("Rejected");
        this._rejectDialog.close();
        oModel.refresh();
      } catch (e) {
        MessageBox.error((e && e.message) || "Reject failed");
      } finally {
        oView.setBusy(false);
      }
    },

    /**
     * Cleanup reject dialog on controller exit.
     */
    onExit: function () {
      if (this._rejectDialog) {
        this._rejectDialog.destroy();
        this._rejectDialog = null;
      }
    }

  });
});
