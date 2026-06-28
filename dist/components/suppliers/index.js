import { useState } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/suppliers/supplier-form.tsx
var PAYMENT_METHODS = [
  { value: "", label: "Not configured" },
  { value: "mpesa", label: "M-Pesa (Mobile)" },
  { value: "mpesa_b2b", label: "M-Pesa B2B (Paybill)" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" }
];
var inputCls = "w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none";
var labelCls = "text-sm font-medium";
var sectionLabelCls = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3";
function SupplierForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onSuccess,
  onCancel,
  onError,
  renderBankFields,
  hidePaymentConfig = false,
  className = "",
  submitLabel
}) {
  const iv = initialValues ?? {};
  const [name, setName] = useState(iv.name ?? "");
  const [contact, setContact] = useState(iv.contact_person ?? "");
  const [email, setEmail] = useState(iv.email ?? "");
  const [phone, setPhone] = useState(iv.phone ?? "");
  const [address, setAddress] = useState(iv.address ?? "");
  const [notes, setNotes] = useState(iv.notes ?? "");
  const [taxNumber, setTaxNumber] = useState(iv.tax_number ?? "");
  const [taxPin, setTaxPin] = useState(iv.tax_pin ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    iv.payment_method_type ?? ""
  );
  const [mpesaPhone, setMpesaPhone] = useState(iv.mpesa_phone ?? "");
  const [mpesaBusinessName, setMpesaBusinessName] = useState(iv.mpesa_business_name ?? "");
  const [bankAccount, setBankAccount] = useState(iv.bank_account_number ?? "");
  const [bankName, setBankName] = useState(iv.bank_name ?? "");
  const [bankCode, setBankCode] = useState("");
  const [bankBranch, setBankBranch] = useState(iv.bank_branch ?? "");
  const [autoPay, setAutoPay] = useState(iv.auto_pay_enabled ?? false);
  const [requiresInvoice, setRequiresInvoice] = useState(
    iv.requires_invoice_before_payment ?? false
  );
  const [paymentTerms, setPaymentTerms] = useState(
    iv.payment_terms_days != null ? String(iv.payment_terms_days) : ""
  );
  const [creditLimit, setCreditLimit] = useState(
    iv.credit_limit != null ? String(iv.credit_limit) : ""
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const isMpesa = paymentMethod === "mpesa" || paymentMethod === "mpesa_b2b";
  const isBank = paymentMethod === "bank_transfer";
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Supplier name is required");
      return;
    }
    setError(null);
    setPending(true);
    const payload = {
      name: name.trim(),
      contact_person: contact.trim() || void 0,
      email: email.trim() || void 0,
      phone: phone.trim() || void 0,
      address: address.trim() || void 0,
      notes: notes.trim() || void 0,
      tax_number: taxNumber.trim() || void 0,
      tax_pin: taxPin.trim() || void 0,
      payment_method_type: hidePaymentConfig ? void 0 : paymentMethod || void 0,
      mpesa_phone: !hidePaymentConfig && isMpesa ? mpesaPhone.trim() || void 0 : void 0,
      mpesa_business_name: !hidePaymentConfig && isMpesa ? mpesaBusinessName.trim() || void 0 : void 0,
      bank_account_number: !hidePaymentConfig && isBank ? bankAccount.trim() || void 0 : void 0,
      bank_name: !hidePaymentConfig && isBank ? bankName.trim() || void 0 : void 0,
      bank_branch: !hidePaymentConfig && isBank ? bankBranch.trim() || void 0 : void 0,
      auto_pay_enabled: !hidePaymentConfig ? autoPay || void 0 : void 0,
      requires_invoice_before_payment: !hidePaymentConfig ? requiresInvoice || void 0 : void 0,
      payment_terms_days: !hidePaymentConfig && paymentTerms ? Number(paymentTerms) : void 0,
      credit_limit: !hidePaymentConfig && creditLimit ? Number(creditLimit) : void 0
    };
    try {
      const created = await onSubmit(payload);
      onSuccess?.(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save supplier. Please try again.";
      setError(msg);
      onError?.(msg);
    } finally {
      setPending(false);
    }
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: `space-y-5 ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: sectionLabelCls, children: "Basic Information" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Supplier Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls,
              placeholder: "e.g. Acme Supplies Ltd",
              value: name,
              onChange: (e) => setName(e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Contact Person" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls,
              placeholder: "Full name",
              value: contact,
              onChange: (e) => setContact(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                type: "email",
                placeholder: "email@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Phone" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "+254 700 000000",
                value: phone,
                onChange: (e) => setPhone(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Tax Number (KRA PIN)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "e.g. A000000000B",
                value: taxNumber,
                onChange: (e) => setTaxNumber(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Tax PIN" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Tax PIN",
                value: taxPin,
                onChange: (e) => setTaxPin(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Address" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls,
              placeholder: "Physical or postal address",
              value: address,
              onChange: (e) => setAddress(e.target.value)
            }
          )
        ] })
      ] })
    ] }),
    !hidePaymentConfig && /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-5", children: [
      /* @__PURE__ */ jsx("p", { className: sectionLabelCls, children: "Payment Configuration" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Payment Method" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: paymentMethod,
              onChange: (e) => setPaymentMethod(e.target.value),
              className: inputCls,
              children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsx("option", { value: m.value, children: m.label }, m.value))
            }
          )
        ] }),
        isMpesa && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "M-Pesa Phone" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "254700000000",
                value: mpesaPhone,
                onChange: (e) => setMpesaPhone(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Business Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Paybill business name",
                value: mpesaBusinessName,
                onChange: (e) => setMpesaBusinessName(e.target.value)
              }
            )
          ] })
        ] }),
        isBank && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          renderBankFields ? renderBankFields({
            bankName,
            bankCode,
            accountNumber: bankAccount,
            onChange: (patch) => {
              if (patch.bank_name !== void 0) setBankName(patch.bank_name);
              if (patch.bank_code !== void 0) setBankCode(patch.bank_code);
              if (patch.account_number !== void 0) setBankAccount(patch.account_number);
            }
          }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Bank Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: inputCls,
                  placeholder: "Bank name",
                  value: bankName,
                  onChange: (e) => setBankName(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Account Number" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: inputCls,
                  placeholder: "Account number",
                  value: bankAccount,
                  onChange: (e) => setBankAccount(e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Branch (optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                placeholder: "Branch name",
                value: bankBranch,
                onChange: (e) => setBankBranch(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Payment Terms (days)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                type: "number",
                min: "0",
                placeholder: "e.g. 30",
                value: paymentTerms,
                onChange: (e) => setPaymentTerms(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Credit Limit" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: inputCls,
                type: "number",
                min: "0",
                placeholder: "0",
                value: creditLimit,
                onChange: (e) => setCreditLimit(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 pt-1", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: autoPay,
                onChange: (e) => setAutoPay(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Enable Auto-Pay (automatically trigger payout on PO receipt)" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: requiresInvoice,
                onChange: (e) => setRequiresInvoice(e.target.checked),
                className: "rounded"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Requires Invoice Before Payment" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Notes" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          placeholder: "Additional notes about this supplier...",
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 2,
          className: `${inputCls} resize-none`
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
      onCancel && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: pending,
          className: "flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity",
          children: pending ? "Saving..." : submitLabel ?? (isEdit ? "Update" : "Create")
        }
      )
    ] })
  ] });
}

export { SupplierForm };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map