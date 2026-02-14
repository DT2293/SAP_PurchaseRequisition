using pr from '../db/schema';

service PRService {

  entity Departments              as projection on pr.Departments;

  entity Vendors                  as projection on pr.Vendors;

  entity Products                 as
    projection on pr.Products {
      productId,
      productName,
      description,
      uom,
      basePrice,
      currencyCode
    };


  entity PurchaseRequisitions     as
    projection on pr.PurchaseRequisitions {
      prId,
      requesterName,
      deptId,
      vendorId,
      prDate,
      status,
      currencyCode,
      totalAmount @readonly,
      rejectReason,
      dept   : Association to Departments
                 on deptId = dept.deptId,
      vendor : Association to Vendors
                 on vendorId = vendor.vendorId,
      items
    };


  entity PurchaseRequisitionItems as
    projection on pr.PurchaseRequisitionItems {
      *,
      lineAmount @readonly
    };

  action approvePR(prId: String)                      returns ActionResult;
  action rejectPR(prId: String, rejectReason: String) returns ActionResult;

  type ActionResult {
    prId    : String;
    status  : String;
    message : String;
  }

}
