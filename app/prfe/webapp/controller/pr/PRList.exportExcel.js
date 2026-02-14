sap.ui.define([
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/m/MessageToast"
], function (Spreadsheet, exportLibrary, MessageToast) {
    "use strict";

    return {
        downloadExcel: function (oController) {
            const oTable = oController.byId("tblPR");
            const oBinding = oTable.getBinding("items");
            const aContexts = oBinding.getCurrentContexts();

            if (!aContexts || !aContexts.length) {
                MessageToast.show("No data to export");
                return;
            }

            const aData = aContexts.map(function (oCtx) {
                const o = oCtx.getObject();
                return {
                    prId: o.prId,
                    requesterName: o.requesterName,
                    deptName: o.dept?.deptName,
                    vendorName: o.vendor?.vendorName,
                    prDateDisplay: o.prDate,
                    status: o.status,
                    totalAmount: o.totalAmount,
                    currencyCode: o.currencyCode
                };
            });

            const aCols = [
                { label: "PR ID", property: "prId", width: 20 },
                { label: "Requester", property: "requesterName", width: 25 },
                { label: "Department", property: "deptName", width: 25 },
                { label: "Vendor", property: "vendorName", width: 25 },
                { label: "Date", property: "prDateDisplay", width: 15 },
                { label: "Status", property: "status", width: 15 },
                { label: "Total Amount", property: "totalAmount", type: exportLibrary.EdmType.Number, scale: 2, textAlign: "End", width: 20 },
                { label: "Currency", property: "currencyCode", width: 10 }
            ];

            const sTimestamp = new Date().toISOString().split("T")[0];
            const oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        freezePane: { rowSplit: 1 }, // freeze top row
                        enableFilter: true
                    },
                    // Conditional formatting
                    styles: {
                        rejected: {
                            type: "cell",
                            criteria: { property: "status", value: "REJECTED" },
                            style: { fontColor: "red", bold: true }
                        }
                    }
                },
                dataSource: aData,
                fileName: "PR_List_" + sTimestamp + ".xlsx",
                worker: false
            };

            const oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().then(function () {
                MessageToast.show("Excel file exported successfully");
            }).finally(function () {
                oSpreadsheet.destroy();
            });
        }
    };
});
