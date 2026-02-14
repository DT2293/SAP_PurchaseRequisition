
sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/TextArea",
    "sap/m/Button"
], function (MessageToast, MessageBox, Dialog, TextArea, Button) {
    "use strict";

    function ensureRejectDialog(oController) {
        if (oController._rejectDialog) return;

        oController._rejectTA = new TextArea({
            width: "100%",
            rows: 3,
            placeholder: "Enter reject reason"
        });

        oController._rejectDialog = new Dialog({
            title: "Reject Purchase Requisition",
            contentWidth: "30rem",
            content: [oController._rejectTA],
            beginButton: new Button({
                text: "Confirm",
                type: "Emphasized",
                press: function () {
                    Actions.doReject(oController);
                }
            }),
            endButton: new Button({
                text: "Cancel",
                press: function () {
                    oController._rejectDialog.close();
                }
            })
        });

        oController.getView().addDependent(oController._rejectDialog);
    }

    var Actions = {
        approve: async function (oController) {
            var oView = oController.getView();
            var oModel = oView.getModel();

            var oAction = oModel.bindContext("/approvePR(...)");
            oAction.setParameter("prId", oController._prId);

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

        openReject: function (oController) {
            ensureRejectDialog(oController);
            oController._rejectTA.setValue("");
            oController._rejectDialog.open();
        },

        doReject: async function (oController) {
            var sReason = (oController._rejectTA.getValue() || "").trim();
            if (!sReason) {
                MessageBox.warning("Reject reason is required");
                return;
            }

            var oView = oController.getView();
            var oModel = oView.getModel();

            var oAction = oModel.bindContext("/rejectPR(...)");
            oAction.setParameter("prId", oController._prId);
            oAction.setParameter("rejectReason", sReason);

            oView.setBusy(true);
            try {
                await oAction.execute();
                MessageToast.show("Rejected");
                oController._rejectDialog.close();
                oModel.refresh();
            } catch (e) {
                MessageBox.error((e && e.message) || "Reject failed");
            } finally {
                oView.setBusy(false);
            }
        }
    };

    return Actions;
});

