sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ColumnListItem",
    "sap/m/Select",
    "sap/m/Input",
    "sap/m/Button",
    "sap/ui/core/Item"
], function (Fragment, MessageToast, MessageBox, ColumnListItem, Select, Input, Button, Item) {
    "use strict";

    function genPrId() {
        return "PR_" + Date.now();
    }

    function getISODate(oDate) {
        return oDate ? oDate.toISOString().split("T")[0] : null;
    }

    function _resetCreatePRForm(oController) {
        var oView = oController.getView();
        oView.byId("inpRequester")?.setValue("").setValueState("None");
        oView.byId("selDept")?.setSelectedKey("");
        oView.byId("selVendor")?.setSelectedKey("");
        oView.byId("dpPrDate")?.setDateValue(null);
        oView.byId("tblNewItems")?.removeAllItems();
    }

    function _handleProductChange(oEvent) {
        var oSelect = oEvent.getSource();
        var oContext = oSelect.getSelectedItem().getBindingContext();

        if (!oContext) return;

        oContext.requestObject().then(function (oData) {
            var oRow = oSelect.getParent();
            oRow.getCells()[1].setValue(oData.description || "");
        }).catch(function () {
            MessageToast.show("Không lấy được dữ liệu sản phẩm");
        });
    }

    return {
        openCreateDialog: function (oController) {
            var oView = oController.getView();
            if (!oController._pDialog) {
                oController._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "prfe.view.fragment.CreatePR",
                    controller: oController
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.attachAfterClose(function () {
                        _resetCreatePRForm(oController);
                    });
                    return oDialog;
                });
            }
            oController._pDialog.then(function (oDialog) {
                _resetCreatePRForm(oController);
                oDialog.open();
            });
        },

        handleProductChange: function (oController, oEvent) {
            _handleProductChange(oEvent);
        },

        removeItemRow: function (oController, oEvent) {
            var oRow = oEvent.getSource().getParent();
            oController.byId("tblNewItems")?.removeItem(oRow);
        },

        confirmCreate: function (oController) {
            var oView = oController.getView();
            var oModel = oView.getModel();

            var sPrId = genPrId();
            var sRequester = oView.byId("inpRequester").getValue().trim();
            var sDept = oView.byId("selDept").getSelectedKey();
            var sVendor = oView.byId("selVendor").getSelectedKey();
            var sDate = getISODate(oView.byId("dpPrDate").getDateValue());

            if (!sRequester || !sDept || !sVendor || !sDate) {
                MessageBox.error("Please fill in all required fields.");
                return;
            }

            var oHeader = {
                prId: sPrId,
                requesterName: sRequester,
                deptId: sDept,
                vendorId: sVendor,
                prDate: sDate
            };

            var oListBinding = oModel.bindList("/PurchaseRequisitions");
            var oContext = oListBinding.create(oHeader);

            oContext.created().then(function () {
                var aItems = oView.byId("tblNewItems").getItems().map(function (oRow, index) {
                    var oCells = oRow.getCells();
                    return {
                        prItemId: sPrId + "-" + (index + 1),
                        prId: sPrId,
                        productId: oCells[0].getSelectedKey(),
                        description: oCells[1].getValue().trim(),
                        quantity: parseInt(oCells[2].getValue(), 10),
                        unitPrice: parseFloat(oCells[3].getValue())
                    };
                });

                var oItemBinding = oModel.bindList("/PurchaseRequisitionItems");
                var bInvalid = aItems.some(function (oItem) {
                    return !oItem.productId || !oItem.quantity || oItem.quantity <= 0 ||
                        isNaN(oItem.unitPrice) || oItem.unitPrice < 0;
                });

                if (bInvalid) {
                    MessageBox.error("Invalid item data.");
                    return;
                }

                aItems.forEach(function (oItem) {
                    oItemBinding.create(oItem);
                });

                MessageToast.show("PR created with items");
                oController.byId("tblPR")?.getBinding("items")?.refresh();
                oView.byId("dlgCreatePR").close();
            }).catch(function (err) {
                MessageBox.error("Error creating PR: " + (err?.message || err));
            });
        },

        addItemRow: function (oController) {
            var oTable = oController.byId("tblNewItems");
            var oNewRow = new ColumnListItem({
                cells: [
                    new Select({
                        forceSelection: false,
                        selectedKey: "",
                        items: {
                            path: "/Products",
                            parameters: { $select: "productId,productName,description" }, 
                            template: new Item({
                                key: "{productId}",
                                text: "{productName}"
                            })
                        },
                        change: function (oEvent) {
                            _handleProductChange(oEvent);
                        }
                    }),

                    new Input({ placeholder: "Description", editable: false }),
                    new Input({ type: "Number" }),
                    new Input({ type: "Number" }),
                    new Button({
                        icon: "sap-icon://delete",
                        type: "Transparent",
                        tooltip: "Delete row",
                        press: oController.onDeleteItemRow.bind(oController)
                    })
                ]
            });
            oTable.addItem(oNewRow);
        },

        cancelCreate: function (oController) {
            oController.getView().byId("dlgCreatePR").close();
        },

        resetCreateForm: function (oController) {
            _resetCreatePRForm(oController);
        }
    };
});
