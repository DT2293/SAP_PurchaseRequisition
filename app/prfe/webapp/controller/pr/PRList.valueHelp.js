
sap.ui.define([
  "sap/m/SelectDialog",
  "sap/m/StandardListItem",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (SelectDialog, StandardListItem, Filter, FilterOperator) {
  "use strict";

  function createDialog(oController, mConfig) {
    var oDialog = new SelectDialog({
      title: mConfig.title,
      liveChange: function (oEvent) {
        var sVal = oEvent.getParameter("value");
        var aF = sVal ? [new Filter(mConfig.searchField, FilterOperator.Contains, sVal)] : [];
        oEvent.getSource().getBinding("items").filter(aF);
      },
      confirm: function (oEvent) {
        var oItem = oEvent.getParameter("selectedItem");
        if (oItem) {
          mConfig.onSelect(oItem);
        }
      },
      items: {
        path: mConfig.path,
        template: new StandardListItem({
          title: mConfig.titleBinding,
          description: mConfig.descBinding
        })
      }
    });
    oController.getView().addDependent(oDialog);
    return oDialog;
  }

  return {
    openDepartmentVH: function (oController) {
      if (!oController._deptDialog) {
        oController._deptDialog = createDialog(oController, {
          title: (oController.getResourceBundle && oController.getResourceBundle().getText("selectDepartment")) || "Select Department",
          path: "/Departments",
          searchField: "deptName",
          titleBinding: "{deptName}",
          descBinding: "{deptId}",
          onSelect: function (oItem) {
            oController.byId("inpDepartment").setValue(oItem.getDescription()); // deptId
          }
        });
      }
      oController._deptDialog.open();
    },

    openVendorVH: function (oController) {
      if (!oController._vendorDialog) {
        oController._vendorDialog = createDialog(oController, {
          title: (oController.getResourceBundle && oController.getResourceBundle().getText("selectVendor")) || "Select Vendor",
          path: "/Vendors",
          searchField: "vendorName",
          titleBinding: "{vendorName}",
          descBinding: "{vendorId}",
          onSelect: function (oItem) {
            oController.byId("inpVendor").setValue(oItem.getDescription()); // vendorId
          }
        });
      }
      oController._vendorDialog.open();
    }
  };
});
