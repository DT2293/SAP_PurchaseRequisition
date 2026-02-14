
sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/routing/History"
], function (JSONModel, Filter, FilterOperator, History) {
  "use strict";

  function bindHeaderAndCurrency(oController, sPrId) {
    var oView = oController.getView();
    var oVM = oView.getModel("view");

    var sPath = "/PurchaseRequisitions('" + encodeURIComponent(sPrId) + "')";
    oView.bindElement({
      path: sPath,
      events: {
        change: function () {
          var oCtx = oView.getBindingContext();
          if (!oCtx) return;
          var sCurr = oCtx.getProperty("currencyCode");
          oVM.setProperty("/currencyCode", sCurr || "");
        }
      }
    });
  }

  function applyItemsFilter(oController, sPrId) {
    var oTbl = oController.byId("tblItems");
    if (!oTbl) return;

    var fn = function () {
      var oBinding = oTbl.getBinding("items");
      if (oBinding) {
        oBinding.filter([new Filter("prId", FilterOperator.EQ, sPrId)]);
      }
    };

    // Apply ngay + apply lại sau render tick
    fn();
    setTimeout(fn, 0);
  }

  return {
    initViewModelAndRoute: function (oController) {
      // view model để bind trạng thái hiển thị
      var oVM = new JSONModel({
        currencyCode: ""
      });
      oController.getView().setModel(oVM, "view");

      oController.getRouter()
        .getRoute("prDetail")
        .attachPatternMatched(this.onMatched, oController);
    },

    onMatched: function (oEvent) {
      var sPrId = oEvent.getParameter("arguments").prId;
      this._prId = sPrId;

      bindHeaderAndCurrency(this, sPrId);
      applyItemsFilter(this, sPrId);
    },

    navBack: function (oController) {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        // NOTE: route name phải đúng trong manifest
        // Nếu route list của bạn là "prList" (lowercase) thì đổi ở đây cho đúng
        oController.getRouter().navTo("PRList", {}, true);
      }
    }
  };
});
