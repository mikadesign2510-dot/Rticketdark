const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Insert components and constants at the top
const componentsStr = `
const BACKGROUND_COLORS = [
  { label: 'سرمه‌ای تیره (پیش‌فرض)', value: '#0A0C13' },
  { label: 'سرمه‌ای نفتی', value: '#121524' },
  { label: 'سیاه خالص', value: '#000000' },
  { label: 'خاکستری تیره', value: '#1A1D2E' },
  { label: 'تینت صورتی', value: 'rgba(255, 51, 102, 0.05)' },
  { label: 'تینت فیروزه‌ای', value: 'rgba(6, 182, 212, 0.05)' },
];

const BORDER_COLORS = [
  { label: 'بدون حاشیه', value: 'transparent' },
  { label: 'سرمه‌ای (پیش‌فرض)', value: '#2B314B' },
  { label: 'سفید محو', value: 'rgba(255,255,255,0.1)' },
  { label: 'صورتی نئون', value: '#FF3366' },
  { label: 'صورتی محو', value: 'rgba(255, 51, 102, 0.3)' },
  { label: 'آبی فیروزه‌ای', value: '#06B6D4' },
  { label: 'بنفش', value: '#8B5CF6' },
  { label: 'زرد کهربایی', value: '#F59E0B' },
];

const TEXT_COLORS = [
  { label: 'سفید', value: '#ffffff' },
  { label: 'خاکستری روشن', value: '#F4F4F5' },
  { label: 'صورتی نئون', value: '#FF3366' },
  { label: 'آبی فیروزه‌ای', value: '#06B6D4' },
];

const RADIUS_OPTIONS = [
  { label: 'بدون انحنا', value: '0px' },
  { label: 'کم (8px)', value: '0.5rem' },
  { label: 'متوسط (16px)', value: '1rem' },
  { label: 'زیاد (24px)', value: '1.5rem' },
  { label: 'کاملاً گرد', value: '50%' },
];

const HEIGHT_OPTIONS = [
  { label: 'کوچک', value: '120px' },
  { label: 'متوسط', value: '180px' },
  { label: 'بزرگ', value: '250px' },
  { label: 'خیلی بزرگ', value: '350px' },
];

const ColorSwatchSelector = ({ value, onChange, options, label }: any) => (
  <div className="space-y-3">
    <label className="text-sm font-semibold text-zinc-400 block">{label}</label>
    <div className="flex flex-wrap gap-3">
      {options.map((opt: any) => {
        const isTransparent = opt.value === 'transparent';
        const isColorCode = opt.value.startsWith('#') || opt.value.startsWith('rgba');
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={\`w-10 h-10 rounded-full border-2 transition-all group relative flex items-center justify-center \${
              value === opt.value ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10' : 'border-white/10 hover:border-white/50 hover:scale-105'
            } \${isTransparent ? 'bg-zinc-800' : ''}\`}
            style={isColorCode && !isTransparent ? { background: opt.value } : {}}
            title={opt.label}
          >
            {isTransparent && <span className="w-full h-0.5 bg-red-500/50 absolute -rotate-45" />}
            
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#161B2D] border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  </div>
);

const OptionSelector = ({ value, onChange, options, label }: any) => (
  <div className="space-y-3">
    <label className="text-sm font-semibold text-zinc-400 block">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt: any) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={\`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all \${
            value === opt.value ? 'bg-[#FF3366] border-[#FF3366] text-white shadow-lg shadow-[#FF3366]/20' : 'bg-[#0A0C13] border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
          }\`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default function Admin() {`;

content = content.replace('export default function Admin() {', componentsStr);

// 1. Replace main slider inputs
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه اسلایدر<\/label>\s*<input type="text" value=\{settings\?.mainSliderBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, mainSliderBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#FF3366\]" dir="ltr" placeholder="#0A0C13" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه اسلایدر" value={settings?.mainSliderBgColor || \'#0A0C13\'} onChange={(val: string) => setSettings(s => s ? {...s, mainSliderBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ حاشیه \(Border\)<\/label>\s*<input type="text" value=\{settings\?.mainSliderBorderColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, mainSliderBorderColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#FF3366\]" dir="ltr" placeholder="#2B314B" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ حاشیه (Border)" value={settings?.mainSliderBorderColor || \'#2B314B\'} onChange={(val: string) => setSettings(s => s ? {...s, mainSliderBorderColor: val} : null)} options={BORDER_COLORS} />'
);

// 2. Replace second slider inputs
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه اسلایدر<\/label>\s*<input type="text" value=\{settings\?.secondSliderBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, secondSliderBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" placeholder="#0A0C13" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه اسلایدر" value={settings?.secondSliderBgColor || \'#0A0C13\'} onChange={(val: string) => setSettings(s => s ? {...s, secondSliderBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ متن<\/label>\s*<input type="text" value=\{settings\?.secondSliderTextColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, secondSliderTextColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" placeholder="#ffffff" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ متن" value={settings?.secondSliderTextColor || \'#ffffff\'} onChange={(val: string) => setSettings(s => s ? {...s, secondSliderTextColor: val} : null)} options={TEXT_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">ارتفاع اسلایدر<\/label>\s*<input type="text" value=\{settings\?.secondSliderHeight \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, secondSliderHeight: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" placeholder="180px" \/>\s*<\/div>/,
  '<OptionSelector label="ارتفاع اسلایدر" value={settings?.secondSliderHeight || \'180px\'} onChange={(val: string) => setSettings(s => s ? {...s, secondSliderHeight: val} : null)} options={HEIGHT_OPTIONS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">میزان انحنای گوشه‌ها \(Radius\)<\/label>\s*<input type="text" value=\{settings\?.secondSliderRadius \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, secondSliderRadius: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" placeholder="1\.5rem" \/>\s*<\/div>/,
  '<OptionSelector label="میزان انحنای گوشه‌ها (Radius)" value={settings?.secondSliderRadius || \'1.5rem\'} onChange={(val: string) => setSettings(s => s ? {...s, secondSliderRadius: val} : null)} options={RADIUS_OPTIONS} />'
);


// 3. Replace introbox
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه باکس<\/label>\s*<input type="text" value=\{settings\?.introBoxBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="rgba\(255, 51, 102, 0\.1\) یا #FF3366" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه باکس" value={settings?.introBoxBgColor || \'rgba(255, 51, 102, 0.1)\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ حاشیه \(Border\)<\/label>\s*<input type="text" value=\{settings\?.introBoxBorderColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxBorderColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="rgba\(255, 51, 102, 0\.3\)" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ حاشیه (Border)" value={settings?.introBoxBorderColor || \'rgba(255, 51, 102, 0.3)\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxBorderColor: val} : null)} options={BORDER_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ متن<\/label>\s*<input type="text" value=\{settings\?.introBoxTextColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxTextColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="#ffffff" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ متن" value={settings?.introBoxTextColor || \'#ffffff\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxTextColor: val} : null)} options={TEXT_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">انحنای گوشه‌ها \(Radius\)<\/label>\s*<input type="text" value=\{settings\?.introBoxRadius \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxRadius: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="1rem" \/>\s*<\/div>/,
  '<OptionSelector label="انحنای گوشه‌ها (Radius)" value={settings?.introBoxRadius || \'1rem\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxRadius: val} : null)} options={RADIUS_OPTIONS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">اندازه لوگو \(مثلاً 80px یا 6rem\)<\/label>\s*<input type="text" value=\{settings\?.introBoxLogoSize \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxLogoSize: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="100px" \/>\s*<\/div>/,
  '<OptionSelector label="اندازه لوگو" value={settings?.introBoxLogoSize || \'80px\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxLogoSize: val} : null)} options={[{label:\'کوچک\', value:\'60px\'}, {label:\'متوسط\', value:\'80px\'}, {label:\'بزرگ\', value:\'120px\'}]} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">انحنای گوشه لوگو \(Radius\)<\/label>\s*<input type="text" value=\{settings\?.introBoxLogoRadius \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, introBoxLogoRadius: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\] text-left" dir="ltr" placeholder="50% برای دایره" \/>\s*<\/div>/,
  '<OptionSelector label="انحنای گوشه لوگو" value={settings?.introBoxLogoRadius || \'0px\'} onChange={(val: string) => setSettings(s => s ? {...s, introBoxLogoRadius: val} : null)} options={RADIUS_OPTIONS} />'
);


// 4. Appearance
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه \(Background\)<\/label>\s*<input type="text" value=\{settings\?.headerBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, headerBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" placeholder="#0A0C13" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه (Background)" value={settings?.headerBgColor || \'#0A0C13\'} onChange={(val: string) => setSettings(s => s ? {...s, headerBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ حاشیه پایین \(Border Bottom\)<\/label>\s*<input type="text" value=\{settings\?.headerBorderColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, headerBorderColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" placeholder="transparent" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ حاشیه پایین (Border Bottom)" value={settings?.headerBorderColor || \'transparent\'} onChange={(val: string) => setSettings(s => s ? {...s, headerBorderColor: val} : null)} options={BORDER_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه \(Background\)<\/label>\s*<input type="text" value=\{settings\?.footerBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, footerBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" placeholder="#06070B" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه (Background)" value={settings?.footerBgColor || \'#06070B\'} onChange={(val: string) => setSettings(s => s ? {...s, footerBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ حاشیه بالا \(Border Top\)<\/label>\s*<input type="text" value=\{settings\?.footerBorderColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, footerBorderColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" placeholder="#191C2C" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ حاشیه بالا (Border Top)" value={settings?.footerBorderColor || \'#191C2C\'} onChange={(val: string) => setSettings(s => s ? {...s, footerBorderColor: val} : null)} options={BORDER_COLORS} />'
);

// General UI Search/Card Colors
content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه جستجو<\/label>\s*<input type="text" value=\{settings\?.searchBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, searchBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه جستجو" value={settings?.searchBgColor || \'#121524\'} onChange={(val: string) => setSettings(s => s ? {...s, searchBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ حاشیه جستجو<\/label>\s*<input type="text" value=\{settings\?.searchBorderColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, searchBorderColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ حاشیه جستجو" value={settings?.searchBorderColor || \'#2B314B\'} onChange={(val: string) => setSettings(s => s ? {...s, searchBorderColor: val} : null)} options={BORDER_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ پس‌زمینه کارت رویداد<\/label>\s*<input type="text" value=\{settings\?.cardBgColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, cardBgColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ پس‌زمینه کارت رویداد" value={settings?.cardBgColor || \'#121524\'} onChange={(val: string) => setSettings(s => s ? {...s, cardBgColor: val} : null)} options={BACKGROUND_COLORS} />'
);

content = content.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-zinc-400">رنگ متن کارت رویداد<\/label>\s*<input type="text" value=\{settings\?.cardTextColor \|\| ''\} onChange=\{\(e\) => setSettings\(s => s \? \{\.\.\.s, cardTextColor: e\.target\.value\} : null\)\} className="w-full bg-\[#0A0C13\] border border-white\/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-\[#06B6D4\]" dir="ltr" \/>\s*<\/div>/,
  '<ColorSwatchSelector label="رنگ متن کارت رویداد" value={settings?.cardTextColor || \'#ffffff\'} onChange={(val: string) => setSettings(s => s ? {...s, cardTextColor: val} : null)} options={TEXT_COLORS} />'
);


fs.writeFileSync('src/pages/Admin.tsx', content);

console.log('Modified Admin.tsx successfully');
