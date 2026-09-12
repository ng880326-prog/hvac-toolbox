// Module: Web Tools & Reference (選型網站/參考) — from 'Website' + 'Supplier' sheets
import { register } from '../registry.js';
import { h, card } from '../ui.js';
import { SUPPLIERS } from '../data/suppliers.js';

const I18N = {
  title: { en: 'Web Tools & Reference', zh: '選型網站與參考' },
  desc: { en: 'Equipment selection portals from the workbook Website sheet (logins/passwords intentionally omitted), and supplier/product references from the Supplier sheet.', zh: '原檔 Website 工作表的設備選型入口（密碼刻意不列出），及 Supplier 工作表之供應商參考。' },
  cat: { en: 'Equipment', zh: '設備類' },
  brand: { en: 'Brand', zh: '品牌' },
  link: { en: 'Link', zh: '連結' },
  note: { en: 'Login credentials stored in the workbook are not carried into the app for security.', zh: '原檔內存放的登入帳密基於安全考量不帶入 App。' },
};

const LINKS = [
  { cat: 'Fan', brand: 'Ventaxia', url: 'http://ventaxia.fanselector.co.uk/' },
  { cat: 'Pump', brand: 'Paco / Grundfos', url: 'http://net.grundfos.com/Appl/WebCAPS/InitCtrl?mode=0' },
  { cat: 'Pump', brand: 'Paco Express Suite', url: 'http://www.pacoexpresssuite.com/' },
  { cat: 'Heat Exchanger', brand: 'Hisaka', url: 'http://www.hisaka.co.jp/simulator_english/' },
  { cat: 'Cooling Tower', brand: 'SPX', url: 'http://qtcapps.ct.spx.com' },
  { cat: 'Cooling Tower', brand: 'Mesan', url: 'http://model.mesanct.com/' },
  { cat: 'Cooling Tower', brand: 'Ryowo', url: 'http://www.ryowo.com/Company.php' },
  { cat: 'Control', brand: 'Honeywell', url: 'http://www.buildingcontrolworkbench.com/BCWInfo/GrayBook/Cgray.htm' },
];

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, T('cat')), h('th', {}, T('brand')), h('th', {}, T('link'))));
    for (const l of LINKS) {
      tbl.append(h('tr', {},
        h('td', {}, l.cat),
        h('td', {}, l.brand),
        h('td', {}, h('a', { href: l.url, target: '_blank', rel: 'noopener' }, l.url))));
    }
    body.append(tbl, h('div', { class: 'note' }, T('note')));
  }, { src: 'Website sheet (workbook)' }));

  // Supplier directory from the workbook (contacts intentionally excluded)
  root.append(card(L({ en: 'Supplier Directory (by equipment)', zh: '供應商目錄（按設備類）' }), '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, L({ en: 'Category', zh: '類別' })), h('th', {}, 'Brand'), h('th', {}, L({ en: 'Supplier', zh: '供應商' }))));
    for (const s of SUPPLIERS) tbl.append(h('tr', {}, h('td', {}, s.cat), h('td', {}, s.brand), h('td', {}, s.supplier)));
    body.append(tbl, h('div', { class: 'note' },
      L({ en: 'Categories: chiller, cooling tower, swimming-pool heat pump, fan, diffuser, split AC/VRV, DX AHU, BMS, copper pipe, insulation, heat exchanger, silencer, chilled beam. Contact details (email/phone/address) from the workbook are not carried into the app.', zh: '涵蓋：冷水機、冷卻塔、泳池熱泵、風機、送風口、分體/VRV、DX 空調機、BMS、銅管、保溫、換熱器、消聲器、冷梁。原檔中的聯絡資料（電郵/電話/地址）基於隱私不帶入。' })));
  }, { src: 'Supplier sheet (workbook)' }));
}

register({ id: 'webtools', icon: '🌐', group: 'general', title: I18N.title, desc: I18N.desc, src: 'Website / Supplier sheets', render });
