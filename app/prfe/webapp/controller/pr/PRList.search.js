
sap.ui.define([
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
  "use strict";

  function toODataDate(d) {
    return d ? d.toISOString().split("T")[0] : null;
  }

  function buildDateFilters(oController) {
    var a = [];
    var oFrom = oController.byId("dpPRDateFrom").getDateValue();
    var oTo = oController.byId("dpPRDateTo").getDateValue();

    var sFrom = toODataDate(oFrom);
    var sTo = toODataDate(oTo);

    if (sFrom && sTo) {
      var oToPlus1 = new Date(oTo);
      oToPlus1.setDate(oToPlus1.getDate() + 1);
      a.push(new Filter("prDate", FilterOperator.BT, sFrom, toODataDate(oToPlus1)));
    } else if (sFrom) {
      a.push(new Filter("prDate", FilterOperator.GE, sFrom));
    } else if (sTo) {
      var oToPlus1Only = new Date(oTo);
      oToPlus1Only.setDate(oToPlus1Only.getDate() + 1);
      a.push(new Filter("prDate", FilterOperator.LE, toODataDate(oToPlus1Only)));
    }
    return a;
  }

  function buildMultiKeyOrFilter(sPath, aKeys) {
    if (!aKeys || !aKeys.length) return null;
    var aFilters = aKeys.map(function (k) {
      return new Filter(sPath, FilterOperator.EQ, k);
    });
    return new Filter({ filters: aFilters, and: false });
  }

  function buildAmountFilters(oController) {
    var a = [];
    var sMin = oController.byId("inpAmountFrom").getValue();
    var sMax = oController.byId("inpAmountTo").getValue();

    var vMin = sMin !== "" ? Number(String(sMin).replace(/,/g, "")) : null;
    var vMax = sMax !== "" ? Number(String(sMax).replace(/,/g, "")) : null;

    if (vMin !== null && !isNaN(vMin) && vMax !== null && !isNaN(vMax)) {
      a.push(new Filter("totalAmount", FilterOperator.BT, vMin, vMax));
    } else if (vMin !== null && !isNaN(vMin)) {
      a.push(new Filter("totalAmount", FilterOperator.GE, vMin));
    } else if (vMax !== null && !isNaN(vMax)) {
      a.push(new Filter("totalAmount", FilterOperator.LE, vMax));
    }
    return a;
  }

  return {
    applySearch: function (oController) {
      var aFilters = [];

      // 1) Date range
      aFilters = aFilters.concat(buildDateFilters(oController));

      // 2) Status multi
      var aStatus = oController.byId("mcStatus").getSelectedKeys();
      var oStatusFilter = buildMultiKeyOrFilter("status", aStatus);
      if (oStatusFilter) aFilters.push(oStatusFilter);

      // 3) Department multi
      var aDeptKeys = oController.byId("mcDepartment").getSelectedKeys();
      var oDeptFilter = buildMultiKeyOrFilter("deptId", aDeptKeys);
      if (oDeptFilter) aFilters.push(oDeptFilter);

      // 4) Vendor multi
      var aVendorKeys = oController.byId("mcVendor").getSelectedKeys();
      var oVendorFilter = buildMultiKeyOrFilter("vendorId", aVendorKeys);
      if (oVendorFilter) aFilters.push(oVendorFilter);

      // 5) Amount
      aFilters = aFilters.concat(buildAmountFilters(oController));

      // Apply
      var oTable = oController.byId("tblPR");
      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    }
  };
});
