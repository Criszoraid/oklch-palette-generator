type BlueCardTemplateProps = {
  className?: string;
};

function BlueCardTemplate({ className }: BlueCardTemplateProps) {
  return (
    <div className={className} data-name="blue Card Template">
      <div className="bg-white content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-nowrap w-full" data-name="WCAGInfo">
        <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[13px] text-black">WCAG 16.59:1</p>
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#21c44a] text-[11px]">✓ Text: AAA</p>
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#21c44a] text-[11px]">✓ Large: AAA</p>
      </div>
      <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-nowrap w-full" data-name="APCAInfo">
        <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[13px] text-black">APCA 95</p>
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#21c44a] text-[11px]">✓ Body text: Pass</p>
      </div>
      <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />
      <div className="content-stretch flex flex-col font-['Inter:Medium',sans-serif] font-medium gap-[3px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[#808080] text-[10px] text-nowrap w-full" data-name="ColorValues">
        <p className="relative shrink-0">HEX: #FFFFFF</p>
        <p className="relative shrink-0">RGB: 255, 255, 255</p>
        <p className="relative shrink-0">OKLCH: 97.0% 0.151 262.8</p>
      </div>
    </div>
  );
}

export default function BlueCardTemplate1() {
  return <BlueCardTemplate className="bg-white relative rounded-[12px] size-full" />;
}