sap.ui.define([
  "prfe/controller/BaseController",
  "prfe/controller/pr/PRList.search",
  "prfe/controller/pr/PRList.valueHelp",
  "prfe/controller/pr/PRList.createPR",
  "prfe/controller/pr/PRList.exportExcel",
  "prfe/controller/pr/PRList.lifecycle"
], function (BaseController, Search, ValueHelp, CreatePR, ExportExcel, Lifecycle) {
  "use strict";

  /**
   * Controller for Purchase Requisition List page.
   * Handles navigation, search, value help, create PR dialog, export, and lifecycle events.
   */
  return BaseController.extend("prfe.controller.PRList", {

    /**
     * Navigate to PR Detail page when a PR row is pressed.
     * @param {sap.ui.base.Event} oEvent Press event from the table row
     */
    onPressPR: function (oEvent) {
      var sPrId = oEvent.getSource().getBindingContext()?.getProperty("prId");
      this.getRouter().navTo("prDetail", { prId: sPrId }, false);
    },

    /**
     * Apply search filters from FilterBar.
     */
    onSearch: function () {
      Search.applySearch(this);
    },

    /**
     * Open value help dialog for Department filter.
     */
    onVHDepartment: function () {
      ValueHelp.openDepartmentVH(this);
    },

    /**
     * Open value help dialog for Vendor filter.
     */
    onVHVendor: function () {
      ValueHelp.openVendorVH(this);
    },

    /**
     * Open Create Purchase Requisition dialog.
     */
    onOpenCreatePR: function () {
      CreatePR.openCreateDialog(this);
    },

    /**
     * Confirm and create new Purchase Requisition with items.
     */
    onConfirmCreatePR: function () {
      CreatePR.confirmCreate(this);
    },

    /**
     * Handle product change in item row (auto-fill description).
     * @param {sap.ui.base.Event} oEvent Change event from product Select
     */
    onProductChange: function (oEvent) {
      CreatePR.handleProductChange(this, oEvent);
    },

    /**
     * Add new item row to PR items table.
     */
    onAddItem: function () {
      CreatePR.addItemRow(this);
    },

    /**
     * Delete item row from PR items table.
     * @param {sap.ui.base.Event} oEvent Press event from delete button
     */
    onDeleteItemRow: function (oEvent) {
      CreatePR.removeItemRow(this, oEvent);
    },

    /**
     * Cancel and close Create PR dialog.
     */
    onCancelCreatePR: function () {
      CreatePR.cancelCreate(this);
    },

    /**
     * Export current PR list to Excel file.
     */
    onDownloadExcel: function () {
      ExportExcel.downloadExcel(this);
    },

    /**
     * Handle controller exit lifecycle.
     */
    onExit: function () {
      Lifecycle.onExit(this);
    }
  });
});
