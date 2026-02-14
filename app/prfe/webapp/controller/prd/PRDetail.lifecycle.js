
// sap.ui.define([], function () {
//   "use strict";

//   return {
//     onExit: function (oController) {
//       if (oController._rejectDialog) {
//         oController._rejectDialog.destroy();
//         oController._rejectDialog = null;
//       }
//       oController._rejectTA = null;
//     }
//   };
// });


sap.ui.define([
    "prfe/controller/BaseController",
    "prfe/controller/prd/PRDetail.formatter",
    "prfe/controller/prd/PRDetail.routing",
    "prfe/controller/prd/PRDetail.actions",
    "prfe/controller/prd/PRDetail.lifecycle"
], function (
    BaseController,
    Formatter,
    Routing,
    Actions,
    Lifecycle
) {
    "use strict";

    return BaseController.extend("prfe.controller.PRDetail", {

        formatStatusState: Formatter.formatStatusState,

        onInit: function () {
            Routing.initViewModelAndRoute(this);
        },

        onNavBack: function () {
            Routing.navBack(this);
        },
        onApprove: function () {
            return Actions.approve(this);
        },

        onOpenReject: function () {
            Actions.openReject(this);
        },
        _doReject: function () {
            return Actions.doReject(this);
        },

        onExit: function () {
            Lifecycle.onExit(this);
        }
    });
});
