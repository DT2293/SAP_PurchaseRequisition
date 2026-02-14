namespace pr;

type CurrencyCode : String(3);
type Amount       : Decimal(15, 2);

entity Departments {
  key deptId   : String(10);
      deptName : String(80);
}

entity Vendors {
  key vendorId     : String(10);
      vendorName   : String(120);
      taxCode      : String(40);
      currencyCode : CurrencyCode; // e.g., VND, USD
}

entity Products {
  key productId    : String(20);
      productName  : String(120);
      description  : String;
      uom          : String(10);
      basePrice    : Amount;
      currencyCode : CurrencyCode;
}

entity PurchaseRequisitions {
  key prId          : String(20);

      requesterName : String(80);

      // Foreign keys (explicit) + associations
      deptId        : String(10);
      dept          : Association to Departments
                        on dept.deptId = deptId;

      vendorId      : String(10);
      vendor        : Association to Vendors
                        on vendor.vendorId = vendorId;

      prDate        : Date;

      status        : String(10); // SUBMITTED / APPROVED / REJECTED
      currencyCode  : CurrencyCode;

      totalAmount   : Amount; // calculated
      rejectReason  : String(255); // required when REJECTED

      // Composition: PR must have items
      items         : Composition of many PurchaseRequisitionItems
                        on items.prId = $self.prId;
}

entity PurchaseRequisitionItems {
  key prItemId    : String(30);

      // Foreign keys (explicit) + associations
      prId        : String(20);
      pr          : Association to PurchaseRequisitions
                      on pr.prId = prId;

      productId   : String(20);
      product     : Association to Products
                      on product.productId = productId;

      description : String(255);

      quantity    : Decimal(15, 2);
      unitPrice   : Amount;

      lineAmount  : Amount; 
}
