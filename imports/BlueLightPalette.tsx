import clsx from "clsx";
type WcagInfo1Props = {
  text: string;
  text1: string;
  text2: string;
  additionalClassNames?: string;
};

function WcagInfo1({ text, text1, text2, additionalClassNames = "" }: WcagInfo1Props) {
  return (
    <div className={clsx("content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-nowrap w-full", additionalClassNames)}>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[13px] text-white">{text}</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#f04236] text-[11px]">{text1}</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#21c44a] text-[11px]">{text2}</p>
    </div>
  );
}
type ColorValuesProps = {
  text: string;
  text1: string;
  text2: string;
};

function ColorValues({ text, text1, text2 }: ColorValuesProps) {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Medium',sans-serif] font-medium gap-[3px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[10px] text-nowrap text-white w-full">
      <p className="relative shrink-0">{text}</p>
      <p className="relative shrink-0">{text1}</p>
      <p className="relative shrink-0">{text2}</p>
    </div>
  );
}
type ApcaInfoProps = {
  text: string;
  text1: string;
};

function ApcaInfo({ text, text1 }: ApcaInfoProps) {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-nowrap w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[13px] text-white">{text}</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#f04236] text-[11px]">{text1}</p>
    </div>
  );
}
type WcagInfoProps = {
  text: string;
  text1: string;
  text2: string;
  additionalClassNames?: string;
};

function WcagInfo({ text, text1, text2, additionalClassNames = "" }: WcagInfoProps) {
  return (
    <div className={clsx("content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-nowrap w-full", additionalClassNames)}>
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[13px] text-white">{text}</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#f04236] text-[11px]">{text1}</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#f04236] text-[11px]">{text2}</p>
    </div>
  );
}

function Frame() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue() {
  return (
    <div className="bg-[#bff4ff] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-[157px]" data-name="blue-100">
      <WcagInfo text="WCAG 1.19:1" text1="✗ Text: Fail" text2="✗ Large: Fail" additionalClassNames="bg-[#bff4ff]" />
      <ApcaInfo text="APCA 9" text1="✗ Body text: Fail" />
      <Frame />
      <ColorValues text="HEX: #BFF4FF" text1="RGB: 191, 244, 255" text2="OKLCH: 97.0% 0.151 262.8" />
    </div>
  );
}

function Blue1() {
  return (
    <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0" data-name="blue-100">
      <Blue />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-100</p>
    </div>
  );
}

function Frame1() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue2() {
  return (
    <div className="bg-[#9ad5ff] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-[158px]" data-name="blue-200">
      <WcagInfo text="WCAG 1.57:1" text1="✗ Text: Fail" text2="✗ Large: Fail" additionalClassNames="bg-[#9ad5ff]" />
      <ApcaInfo text="APCA 26" text1="✗ Body text: Fail" />
      <Frame1 />
      <ColorValues text="HEX: #9AD5FF" text1="RGB: 154, 213, 255" text2="OKLCH: 87.9% 0.170 262.8" />
    </div>
  );
}

function Blue3() {
  return (
    <div className="[grid-area:1_/_2] bg-white content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0" data-name="blue-200">
      <Blue2 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-200</p>
    </div>
  );
}

function Frame2() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue4() {
  return (
    <div className="bg-[#79b5ff] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-[160px]" data-name="blue-300">
      <WcagInfo text="WCAG 2.13:1" text1="✗ Text: Fail" text2="✗ Large: Fail" additionalClassNames="bg-[#79b5ff]" />
      <ApcaInfo text="APCA 42" text1="✗ Body text: Fail" />
      <Frame2 />
      <ColorValues text="HEX: #79B5FF" text1="RGB: 121, 181, 255" text2="OKLCH: 78.8% 0.185 262.8" />
    </div>
  );
}

function Blue5() {
  return (
    <div className="[grid-area:1_/_3] content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0" data-name="blue-300">
      <Blue4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-300</p>
    </div>
  );
}

function Frame3() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue6() {
  return (
    <div className="bg-[#5997ff] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-[160px]" data-name="blue-400">
      <WcagInfo text="WCAG 2.88:1" text1="✗ Text: Fail" text2="✗ Large: Fail" additionalClassNames="bg-[#5997ff]" />
      <ApcaInfo text="APCA 55" text1="✗ Body text: Fail" />
      <Frame3 />
      <ColorValues text="HEX: #5997FF" text1="RGB: 89, 151, 255" text2="OKLCH: 69.7% 0.195 262.8" />
    </div>
  );
}

function Blue7() {
  return (
    <div className="[grid-area:1_/_4] content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0" data-name="blue-400">
      <Blue6 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-400</p>
    </div>
  );
}

function Frame4() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue8() {
  return (
    <div className="bg-[#3c78f9] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-[163px]" data-name="blue-500">
      <WcagInfo1 text="WCAG 4.00:1" text1="✗ Text: A" text2="✓ Large: AA" additionalClassNames="bg-[#3c78f9]" />
      <ApcaInfo text="APCA 67" text1="✓ Body text: Pass" />
      <Frame4 />
      <ColorValues text="HEX: #3C78F9" text1="RGB: 60, 120, 249" text2="OKLCH: 60.6% 0.202 262.8" />
    </div>
  );
}

function Blue9() {
  return (
    <div className="[grid-area:1_/_5] content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0" data-name="blue-500">
      <Blue8 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-500</p>
    </div>
  );
}

function Frame5() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="Frame" />;
}

function Blue10() {
  return (
    <div className="bg-[#205bda] content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0" data-name="blue-600">
      <WcagInfo1 text="WCAG 5.88:1" text1="✓ Text: AA" text2="✓ Large: AAA" additionalClassNames="bg-[#205bda]" />
      <ApcaInfo text="APCA 79" text1="✓ Body text: Pass" />
      <Frame5 />
      <ColorValues text="HEX: #205BDA" text1="RGB: 32, 91, 218" text2="OKLCH: 51.4% 0.205 262.8" />
    </div>
  );
}

function Blue11() {
  return (
    <div className="[grid-area:1_/_6] content-stretch flex flex-col gap-[8px] items-center overflow-clip relative shrink-0 w-[164px]" data-name="blue-600">
      <Blue10 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#666] text-[12px] text-center text-nowrap">blue-600</p>
    </div>
  );
}

export default function BlueLightPalette() {
  return (
    <div className="gap-[10px] grid grid-cols-[fit-content(100%)_fit-content(100%)_fit-content(100%)_fit-content(100%)_fit-content(100%)_fit-content(100%)_minmax(0px,_1fr)] grid-rows-[repeat(1,_fit-content(100%))] relative size-full" data-name="blue Light Palette">
      <Blue1 />
      <Blue3 />
      <Blue5 />
      <Blue7 />
      <Blue9 />
      <Blue11 />
    </div>
  );
}