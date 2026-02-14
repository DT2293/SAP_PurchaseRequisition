
sap.ui.define([], function () {
    "use strict";

    return {
        onExit: function (oController) {
            if (oController._deptDialog) { oController._deptDialog.destroy(); oController._deptDialog = null; }
            if (oController._vendorDialog) { oController._vendorDialog.destroy(); oController._vendorDialog = null; }
            if (oController._pDialog) {
                // _pDialog là Promise -> destroy dialog sau khi resolved
                oController._pDialog.then(function (oDialog) {
                    if (oDialog) oDialog.destroy();
                });
                oController._pDialog = null;
            }
        }
    };
});
