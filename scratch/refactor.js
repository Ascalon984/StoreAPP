const fs = require('fs');

const file = 'c:\\Users\\User\\Downloads\\Store App\\src\\app\\checkout\\page.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const beforeUtils = lines.slice(0, 32);
const afterUtils = lines.slice(182);

const handleBackIndex = afterUtils.findIndex(line => line.includes('const handleBack = useCallback(() => {'));
const displayItemsEmptyIndex = afterUtils.findIndex(line => line.includes('if (displayItems.length === 0 && !isSubmitting) {'));

const blok1Start = afterUtils.findIndex(line => line.includes(' {/* ═══ BLOK 1: RINGKASAN PESANAN & TARGET ID ═══ */}'));
const gradientDiv = afterUtils.findIndex(line => line.includes('<div className="h-3 bg-gradient-to-b from-white to-gray-50/30" />'));

const newAfterUtils = [
  ...afterUtils.slice(0, handleBackIndex + 6),
  '',
  ...afterUtils.slice(displayItemsEmptyIndex, blok1Start),
  '            {/* ═══ BLOK 1: RINGKASAN PESANAN & TARGET ID ═══ */}',
  '            <OrderItemsList',
  '              displayItems={displayItems}',
  '              targetIds={targetIds}',
  '              setTargetIds={setTargetIds}',
  '              hasAttemptedSubmit={hasAttemptedSubmit}',
  '              touchedTargets={touchedTargets}',
  '              handleTargetBlur={handleTargetBlur}',
  '              handleRemoveItem={handleRemoveItem}',
  '            />',
  '',
  '            <PaymentSummary',
  '              totalQty={totalQty}',
  '              totalSavings={totalSavings}',
  '              discountPercentage={discountPercentage}',
  '              serviceFee={serviceFee}',
  '              usePoints={usePoints}',
  '              setUsePoints={setUsePoints}',
  '              userPoints={userPoints}',
  '              pointsToUse={pointsToUse}',
  '              total={total}',
  '            />',
  '',
  '            <PaymentMethodSelector',
  '              selectedPayment={selectedPayment}',
  '              selectedSubPayment={selectedSubPayment}',
  '              expandedAccordion={expandedAccordion}',
  '              toggleAccordion={toggleAccordion}',
  '              handleSubPaymentSelect={handleSubPaymentSelect}',
  '              paymentSectionRef={paymentSectionRef}',
  '            />',
  ...afterUtils.slice(gradientDiv + 1)
];

const finalLines = newAfterUtils.map(line => {
  if (line.includes('{getPaymentLabel()}')) {
    return line.replace('{getPaymentLabel()}', '{getPaymentLabel(selectedPayment, selectedSubPayment)}');
  }
  return line;
});

const newContent = [
  ...beforeUtils,
  'import OrderItemsList from "./components/OrderItemsList";',
  'import PaymentSummary from "./components/PaymentSummary";',
  'import PaymentMethodSelector from "./components/PaymentMethodSelector";',
  'import { getEffectiveTargetType, isTargetValid, getPaymentLabel } from "./utils";',
  '',
  '// Mock user dari profil',
  'const PROFILE_USER = {',
  '  name: "Ahmad Fauzi",',
  '  phone: "081-234-5678",',
  '};',
  '',
  ...finalLines
].join('\n');

fs.writeFileSync(file, newContent);
console.log('Refactoring complete');
