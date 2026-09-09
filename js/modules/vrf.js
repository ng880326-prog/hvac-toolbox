// Module: VRF / Multi-Split Selection (多聯機選型) — real HK catalogue data
// Outdoor: Fujitsu General AOHG18LAC2 (real combination table + compensation matrix)
// and Mitsubishi Electric MXZ configs. Selection applies pipe-length & height-difference
// derating from the manufacturer's official compensation coefficient tables.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import { FUJ_COMBOS, FUJ_COOL_MATRIX, FUJ_HEAT_MATRIX, fujCorrection } from '../data/vrf_data.js';
import { MITSUBISHI_MULTI as MXZ } from '../data/hk_catalogs.js';

const I18N = {
  title: { en: 'VRF / Multi-Split Selection', zh: '多聯機（VRF）選型' },
  desc: { en: 'Combination tables (Fujitsu AOHG18LAC2, Mitsubishi MXZ) with official pipe-length & height-difference capacity compensation.', zh: '組合型錄（富士通 AOHG18LAC2、三菱 MXZ）＋官方管路長度／高差容量補償。' },
  outdoor: { en: 'Outdoor unit', zh: '室外機' },
  combi: { en: 'Indoor combination', zh: '室內機組合' },
  pipe: { en: 'Pipe length (actual)', zh: '管長（實長）' },
  hd: { en: 'Height difference H', zh: '高差 H' },
  kw: { en: 'Nameplate capacity', zh: '標稱冷量' },
  factor: { en: 'Compensation factor', zh: '補償係數' },
  corrected: { en: 'Corrected capacity', zh: '修正後冷量' },
  eer: { en: 'EER', zh: 'EER' },
  note: { en: 'Actual length = piping length + bends × 0.3 m (Mitsubishi M-series rule). "Indoor higher/lower than outdoor" sets the sign of H.', zh: '實長＝管路長×彎頭數×0.3 m（三菱 M 系列規則）。室內機高於／低於室外機決定 H 符號。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const OUT = [
      { v: 'fuj', label: 'Fujitsu AOHG18LAC2' },
      { v: 'mitsubishi', label: 'Mitsubishi MXZ' },
    ];
    let oa = 'fuj';
    const oaRow = h('div', { class: 'field' }, h('label', {}, T('outdoor')),
      seg(OUT, oa, (v) => { oa = v; draw(f.all()); }));
    const f = form([
      { key: 'combi', label: T('combi'), def: '7+7', type: 'select', options: FUJ_COMBOS.map((c) => ({ v: c.combi, label: c.combi + ' (' + c.kw.toFixed(2) + ' kW)' })) },
      { key: 'pipe', label: T('pipe'), unit: 'm', def: 15 },
      { key: 'hd', label: T('hd'), unit: 'm', def: 3 },
      { key: 'mode', label: L({ en: 'Mode', zh: '模式' }), def: 'cool', type: 'select', options: [{ v: 'cool', label: 'Cooling' }, { v: 'heat', label: 'Heating' }] },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(oaRow, f.grid, box);
    function draw(st) {
      if ([st.combi, st.pipe, st.hd, st.mode].some((x) => x == null)) { results(box, []); return; }
      let kw = 0, eer = 0;
      if (oa === 'fuj') {
        const c = FUJ_COMBOS.find((x) => x.combi === st.combi);
        kw = c.kw; eer = c.eer;
      } else {
        const m = MXZ.find((x) => x.config === st.combi) || MXZ[0];
        kw = m.kw; eer = m.cop;
      }
      const matrix = st.mode === 'heat' && oa === 'fuj' ? FUJ_HEAT_MATRIX : FUJ_COOL_MATRIX;
      const factor = fujCorrection(st.pipe, st.hd, matrix);
      const corr = factor == null ? null : kw * factor;
      results(box, [
        res(T('kw'), kw, 'kW', { digits: 2 }),
        res(T('factor'), factor == null ? '—' : factor, '—', { digits: 3 }),
        res(T('corrected'), corr == null ? '—' : corr, 'kW', { digits: 2, big: true }),
        res(T('eer'), eer, '—', { digits: 2 }),
      ]);
      if (factor == null) box.append(flag(L({ en: 'Outside the compensation table range — consult manufacturer.', zh: '超出補償表範圍 — 請向廠家查詢。' }), 'bad'));
      box.append(h('div', { class: 'note' },
        L({ en: 'Sources: AOHG18LAC2 combination & compensation coefficient tables; Mitsubishi capacity info.xlsx — G:\\我的雲端硬碟\\catalogue', zh: '來源：AOHG18LAC2 組合及補償係數表；三菱 capacity info.xlsx — G:\\我的雲端硬碟\\catalogue' })));
    }
    draw(f.all());
  }, {
    formula: 'Corrected = Nameplate × f(L, H);  L_actual = L_pipe + n_bends × 0.3 m',
    src: 'Fujitsu General · Mitsubishi Electric official tables (HK catalogue library)',
  }));
}

register({ id: 'vrf', icon: '🏙️', group: 'air', title: I18N.title, desc: I18N.desc, src: 'Fujitsu · Mitsubishi official compensation tables', render });
