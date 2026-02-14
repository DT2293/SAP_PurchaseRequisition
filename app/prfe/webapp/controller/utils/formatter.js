sap.ui.define([], function () {
    "use strict";

    return {
        formatStatusState: function (sStatus) {
            if (sStatus === "APPROVED") return "Success";
            if (sStatus === "REJECTED") return "Error";
            return "Warning"; // SUBMITTED
        },

        formatDeptName: function (sDeptId, aDepts) {
            var oDept = (aDepts || []).find(d => d.deptId === sDeptId);
            return oDept ? oDept.deptName : sDeptId;
        },

        formatVendorName: function (sVendorId, aVendors) {
            var oVendor = (aVendors || []).find(v => v.vendorId === sVendorId);
            return oVendor ? oVendor.vendorName : sVendorId;
        }
    };
});
