// Financing FAQs adapted from EasyDrive Finance (easydrivefinance.ca)
export type FinancingFaq = { q: string; a: string };

export const FINANCING_FAQS: FinancingFaq[] = [
  {
    q: "Will I get approved for a car loan?",
    a: "Approval depends on several factors, including your credit profile, income, employment status, residency, down payment (if applicable), application details, and the vehicle being financed. We work with licensed lenders who review your application and help you explore the best available options for your situation. Our goal is to help you understand what's possible — not to make promises we can't keep.",
  },
  {
    q: "How does submitting an application work?",
    a: "Applying is simple and fully online. You complete a secure pre-qualification application that asks for basic information about you and your financing goals. Once submitted, your application is reviewed by our finance team and shared with licensed lenders who can assess your options. There's no obligation, and submitting an application does not mean you're committing to a purchase.",
  },
  {
    q: "How do I know what my interest rate will be?",
    a: "Your interest rate depends on your credit profile, income, residency status, and the vehicle being financed. To understand what rates may be available to you, complete our secure pre-qualification application. We do not set interest rates ourselves — applying gives you a clearer picture of what options may be available before you move forward.",
  },
  {
    q: "Does submitting a financing application impact my credit score?",
    a: "Each time you submit a financing application, it may slightly affect your credit score by a few points for a short period. Our pre-approval tool is a soft check. We may submit your information to lenders, which could result in a hard check.",
  },
  {
    q: "What is gross income?",
    a: "Gross income is your total monthly or yearly income before any taxes are deducted. This amount is higher than your “net pay” or “take-home pay.”",
  },
  {
    q: "Is my SIN required?",
    a: "Your SIN is not mandatory, although it can help move your application along faster as it allows the lender to pull your credit history more quickly. If you don't enter your SIN, the lender may come back and ask for it if their initial credit pull was unsuccessful.",
  },
  {
    q: "Can I pay off my loan at any time?",
    a: "Yes. Auto loans are open-ended loans that can be paid off before the end of term without penalty, subject to any terms imposed by your lender.",
  },
  {
    q: "How does interest work on my auto loan?",
    a: "Interest is calculated on a per-payment basis. If you pay the loan off early you will not be charged the remaining interest. Note: putting extra money down on the loan after taking possession of the car will not lower your payment instalments — it will only shorten the length of the term.",
  },
  {
    q: "How do payment dates work? Can I change them?",
    a: "Payments will either be 14 or 30 days after delivery (based on whether you selected biweekly or monthly payments). You can change your payment date by contacting your lender after your first payment.",
  },
  {
    q: "Does my loan need to be through my personal bank?",
    a: "No — your loan does not need to come through the same bank as your personal account. However, you'll need to provide a void cheque or direct deposit form for the account you want your automatic payments to come from. Payments cannot come from a credit card account.",
  },
  {
    q: "What if the car I'm trading in already has a loan on it?",
    a: "No problem. If you're bringing over debt from a previous car loan, the original loan is closed and the remaining balance carries into the new financing contract.",
  },
  {
    q: "What is the minimum amount I can borrow?",
    a: "The minimum amount a lender can finance is $7,500 after taxes. If the amount is below this, lenders cannot finance a contract. Once the vehicle is financed you can immediately put money down to reduce it to your desired loan amount.",
  },
  {
    q: "What do I need when applying for financing?",
    a: "You'll need a valid piece of Canadian ID. If you have a co-applicant, they must also provide Canadian ID such as a driver's licence, passport, citizenship card, or permanent resident card. In some cases, we may require additional information such as proof of income or proof of address.",
  },
  {
    q: "How does financing work if I don't have established credit or a fixed income?",
    a: "For newcomers, certain lenders offer programs that may qualify you for financing (conditions apply). If you don't have a fixed income, we recommend applying with a qualified co-applicant.",
  },
  {
    q: "How long does a financing approval take?",
    a: "Credit approvals usually come back with a decision within 24 hours, though this can vary based on your credit history and score. If you don't have excellent or good credit, approvals can sometimes take longer while the lender requests additional information (such as proof of income or a qualified co-applicant).",
  },
  {
    q: "Can I get financing if I'm on a work permit?",
    a: "In some cases, yes. To find out if you're eligible, complete our pre-approval application and our team will review the lender programs available to you.",
  },
  {
    q: "Do all loans require a down payment?",
    a: "Down payments are usually not required. In some cases, lenders may require a down payment to approve financing. If you choose to put a down payment, you may pay as much as you'd like, as long as the minimum amount financed is $7,500.",
  },
  {
    q: "I didn't qualify for a loan. How can I qualify?",
    a: "If you didn't qualify, consider adding a co-applicant to strengthen your profile and increase the likelihood of approval. You can also contact our team and we'll guide you through the next steps.",
  },
];

// Shorter list shown on individual vehicle listings
export const VEHICLE_FINANCE_FAQS: FinancingFaq[] = [
  FINANCING_FAQS[0], // Will I get approved
  FINANCING_FAQS[2], // Interest rate
  FINANCING_FAQS[3], // Credit score impact
  FINANCING_FAQS[16], // Down payment
  FINANCING_FAQS[6], // Pay off any time
  FINANCING_FAQS[14], // How long does approval take
];
